import * as tf from '@tensorflow/tfjs';

let model;

(async function() {
    model = await tf.loadLayersModel('/model/model.json');
})();

const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
};

const decodedCookieValue = decodeURIComponent(getCookie("normalisedFeatureLabel"));
const normalisedFeatureLabel = JSON.parse(decodedCookieValue);

const {
    normalisedFeature,
    normalisedLabel,
} = normalisedFeatureLabel;

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

const predict = (sqFt) => {
    if (model) {
        const inputTensor = tf.tensor1d([parseInt(sqFt)]);
        const normalisedInput = normalise(inputTensor, tf.tensor(normalisedFeature.min), tf.tensor(normalisedFeature.max));
        const normalisedOutputTensor = model.predict(normalisedInput.tensor);
        const outputTensor = denormalise(normalisedOutputTensor, tf.tensor(normalisedLabel.min), tf.tensor(normalisedLabel.max));
        const outputValue = outputTensor.dataSync()[0];
        return outputValue;
    } else {
        return null;
    }
};

document.getElementById("predict").addEventListener("click", () => {
    const predictedPrice = predict(document.getElementById("sqFt").value);
    if (predictedPrice) {
        document.getElementById("result").innerHTML = predictedPrice;
    } else {
        document.getElementById("result").innerHTML = "Model is not ready!";
    }
});