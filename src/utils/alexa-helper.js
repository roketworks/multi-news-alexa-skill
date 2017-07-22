var _ = require('lodash');

module.exports = {
  slotValue: function(slot, useId) {
    let value = slot.value;
    let resolution = (slot.resolutions && slot.resolutions.resolutionsPerAuthority && slot.resolutions.resolutionsPerAuthority.length > 0) ? slot.resolutions.resolutionsPerAuthority[0] : null;

    if(resolution && resolution.status.code == 'ER_SUCCESS_MATCH'){
      let resolutionValue = resolution.values[0].value;
      value = resolutionValue.id && useId ? resolutionValue.id : resolutionValue.name;
    }

    return value;
  },
  buildCardImageObject: function(article) {
    if (_.startsWith(article.urlToImage, 'https://')){
      return {
        smallImgUrl: article.urlToImage,
        largeImageUrl: article.urlToImage
      };
    } 
    return null;
  } 
}