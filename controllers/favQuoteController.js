const FavouriteQuote = require('../models/favouriteQuoteModel');
const Quote = require('../models/quotesModel');

// ✅ Add to favourites
const addFavouriteQuote = async (req, res) => {
  try {
    const { userId, quoteId } = req.body;

    // Check if already exists
    const already = await FavouriteQuote.findOne({ userId, quoteId });
    if (already) {
      return res.status(400).json({
        success: false,
        message: 'Quote already in favourites'
      });
    }

    const favourite = new FavouriteQuote({ userId, quoteId });
    await favourite.save();

    res.status(200).json({
      success: true,
      message: 'Quote added to favourites',
      data: favourite
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

// ✅ Remove from favourites
const removeFavouriteQuote = async (req, res) => {
  try {
    const { userId, quoteId } = req.body;

    const deleted = await FavouriteQuote.findOneAndDelete({ userId, quoteId });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Favourite not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Quote removed from favourites'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

// ✅ Get all favourite quotes of a user
const getUserFavourites = async (req, res) => {
  try {
    const userId = req.params.userId;

    const favourites = await FavouriteQuote.find({ userId })
      .populate({
        path: 'quoteId',
        populate: [
          { path: 'langId', select: 'languageName' },
          { path: 'categoryId', select: 'name' }
        ]
      });

    res.status(200).json({
      success: true,
      message: 'Favourite quotes fetched',
      data: favourites.map(fav => fav.quoteId)
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    });
  }
};

module.exports = {
  addFavouriteQuote,
  removeFavouriteQuote,
  getUserFavourites
};
