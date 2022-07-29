const express = require("express");
const path = require("path");

const { trainModel, saveModel, predict } = require("./modules/model");

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

app.get("/save-model", async (req, res) => {
    const normalisedFeatureLabel = await saveModel();
    if (normalisedFeatureLabel) {
        res.cookie("normalisedFeatureLabel", normalisedFeatureLabel)
        res.status(200).json({ success: "Model Saved!" });
    } else {
        res.status(500).json({ error: "Error saving model" });
    }
});

app.listen(app.get("port"), () => {
    console.log(`App listening on port #${app.get("port")}`);
});
