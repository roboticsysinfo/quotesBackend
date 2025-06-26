const express = require('express');
const router = express.Router();
const {
  addFavouriteQuote,
  removeFavouriteQuote,
  getUserFavourites
} = require('../controllers/favQuoteController');


// Add to fav
router.post('/quote/add', addFavouriteQuote);

// Remove from fav
router.post('/quote/remove', removeFavouriteQuote);

// Get all favourites of user
router.get('/user-fav-quotes/:userId', getUserFavourites);


module.exports = router;
