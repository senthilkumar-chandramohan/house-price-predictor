const tf = require("@tensorflow/tfjs-node");
const path = require("path");

let model, normalisedFeature, normalisedLabel, trainingComplete = false;

const normalise = (tensor, tensorMin = null, tensorMax = null) => {
    const min = tensorMin || tensor.min();
    const max = tensorMax || tensor.max();
    const normalisedTensor = tensor.sub(min).div(max.sub(min));

    return {
        tensor: normalisedTensor,
        min,
        max,
    };
};

const denormalise = (normalisedTensor, min, max) => {
    return normalisedTensor.mul(max.sub(min)).add(min);
};

const createModel = () => {
    const model = tf.sequential();

    model.add(tf.layers.dense({
        units: 1,
        useBias: true,
        activation: "linear",
        inputDim: 1,
    }));

    const optimizer = tf.train.sgd(0.1);
    model.compile({
        loss: "meanSquaredError",
        optimizer,
    });

    return model;
};

const saveModel = async () => {
    if (trainingComplete) {
        try {
            await model.save(`file://${path.join(__dirname, "../../client/public/model")}`);
            return JSON.stringify({
                normalisedFeature: {
                    min: normalisedFeature.min.arraySync(),
                    max: normalisedFeature.max.arraySync(),
                },
                normalisedLabel: {
                    min: normalisedLabel.min.arraySync(),
                    max: normalisedLabel.max.arraySync(),
                }
            });
        } catch(exp) {
            return false;
        }
    } else {
        return false;
    }
}

const train = async (model, trainingFeatureTensor, trainingLabelTensor) => {
    return model.fit(
        trainingFeatureTensor,
        trainingLabelTensor,
        {
            batchSize: 32,
            epochs: 20,
            validationSplit: 0.2,
        }
    );
};

const predict = (sqFt) => {
    if (trainingComplete) {
        const inputTensor = tf.tensor1d([parseInt(sqFt)]);
        const normalisedInput = normalise(inputTensor, normalisedFeature.min, normalisedFeature.max);
        const normalisedOutputTensor = model.predict(normalisedInput.tensor);
        const outputTensor = denormalise(normalisedOutputTensor, normalisedLabel.min, normalisedLabel.max);
        const outputValue = outputTensor.dataSync()[0];
        return outputValue;
    } else {
        return null;
    }
};

const trainModel = async () => {
    const houseSalesDataset = tf.data.csv(`file://${path.join(__dirname, "../data/kc_house_data.csv")}`);
    const pointsDataset = houseSalesDataset.map(record => ({
        x: record.sqft_living,
        y: record.price,
    }));

    const points = await pointsDataset.toArray();

    if (points.length % 2 !== 0) {
        points.pop();
    }

    tf.util.shuffle(points);

    // Extract Features (inputs)
    const featureValues = await points.map(p => p.x);
    const featureTensor = tf.tensor2d(featureValues, [featureValues.length, 1]);

    // Extract Labels (outputs)
    const labelValues = await points.map(p => p.y);
    const labelTensor = tf.tensor2d(labelValues, [labelValues.length, 1]);

    // Normalise Features and Labels
    normalisedFeature = normalise(featureTensor);
    normalisedLabel = normalise(labelTensor);

    const [trainingFeatureTensor, testingFeatureTensor] = tf.split(normalisedFeature.tensor, 2);
    const [trainingLabelTensor, testingLabelTensor] = tf.split(normalisedLabel.tensor, 2);

    model = createModel();

    const result = await train(model, trainingFeatureTensor, trainingLabelTensor);
    const {
        history: {
            loss: trainingLoss,
            val_loss: validationLoss,
        }
    } = result;

    console.log(`Training set loss: ${trainingLoss.pop()}`);
    console.log(`Validation set loss: ${validationLoss.pop()}`);

    const testingLossTensor = model.evaluate(testingFeatureTensor, testingLabelTensor);
    const testingSetLoss = await testingLossTensor.dataSync();
    console.log(`Testing set loss: ${testingSetLoss}`);
    trainingComplete = true;
};

module.exports = {
    trainModel,
    saveModel,
    predict,
};