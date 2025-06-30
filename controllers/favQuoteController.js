const User = require('../models/userModel');
const Quote = require('../models/quotesModel');

// ✅ Add to favourites
const addFavouriteQuote = async (req, res) => {
  try {
    
    const { userId, quoteId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }

    if (user.favouriteQuotes.includes(quoteId)) {
      return res.status(400).json({
        success: false,
        message: 'Quote is already in favourites',
        data: null
      });
    }

    user.favouriteQuotes.push(quoteId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Quote added to favourites',
      data: user.favouriteQuotes
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Internal server error while adding favourite',
      data: null,
      error: err.message
    });
  }
};


// ✅ Remove from favourites
const removeFavouriteQuote = async (req, res) => {
  try {
    const { userId, quoteId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }

    user.favouriteQuotes = user.favouriteQuotes.filter(id => id.toString() !== quoteId);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Quote removed from favourites',
      data: user.favouriteQuotes
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Internal server error while removing favourite',
      data: null,
      error: err.message
    });
  }
};

// ✅ Get all favourite quotes of a user
const getUserFavourites = async (req, res) => {
  try {

    const user = await User.findById(req.params.userId)
      .populate({
        path: 'favouriteQuotes',
        populate: [
          { path: 'langId', select: 'languageName' },
          { path: 'categoryId', select: 'name' }
        ]
      });

    console.log("user", user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        data: null
      });
    }

    res.status(200).json({
      success: true,
      message: 'Favourite quotes fetched successfully',
      data: user.favouriteQuotes
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching favourites',
      data: null,
      error: err.message
    });
  }
};

module.exports = {
  addFavouriteQuote,
  removeFavouriteQuote,
  getUserFavourites
};
