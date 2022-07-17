# house-price-predictor
An AI/ML-powered system to predict housing prices for a given area.

# Steps to install and run the app (NOTE: THE APP IS STILL A WIP)
1. Clone the repository (e.g., git clone https://github.com/senthilkumar-chandramohan/house-price-predictor.git)
2. cd into house-price-predictor directory, run "npm i"
3. cd further into client directory and run "npm i"
4. Run "npm run build" to generate client-side bundle
5. cd ..
6. Run npm start
7. Visit http://localhost:3000/train-model in a browser
8. Give some time for model to train and then visit http://localhost:3000/predict?sqFt=2000
9. Change value against sqFt querystring param to see results for other inputs