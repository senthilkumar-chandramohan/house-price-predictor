const express = require("express");
const path = require("path");

const { trainModel, getModel, predict } = require("./modules/model");

const app = express();

app.set("port", (process.env.PORT || 3000));
app.use("/", express.static(path.join(__dirname, "../client/public")));

app.get("/train-model", (req, res) => {
    trainModel();
    res.send("Model training initiated");
});

app.get("/predict", (req, res) => {
    const predictedPrice = predict(req.query.sqFt);

    if (predictedPrice) {
        res.status(200).json({
            predictedPrice,
        });
    } else {
        res.status(404).json({error: "Model not ready"});
    }
});

app.get("/import-model", (req, res) => {
    const model = getModel();

    if (model) {
        res.status(200).json(model);
    } else {
        res.status(404).json({error: "Model not ready"});
    }
});

app.listen(app.get("port"), () => {
    console.log(`App listening on port #${app.get("port")}`);
});
