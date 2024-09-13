var allLabels = [];
var filteredAuthors = [];

function fetchLabels(filterParam) {
  $.ajax({
    url: '/feeds/posts/summary?alt=json&max-results=0',
    dataType: 'json',
    success: function(data) {
      if (data.feed.category) {
        allLabels = allLabels.concat(data.feed.category.map(cat => cat.term));
      }
      if (data.feed.openSearch$totalResults.$t > allLabels.length) {
        var pageToken = data.feed.openSearch$startIndex.$t + data.feed.openSearch$itemsPerPage.$t;
        fetchLabelsWithToken(pageToken, filterParam);
      } else {
        filterAuthors(filterParam);
      }
    }
  });
}

function fetchLabelsWithToken(pageToken, filterParam) {
  $.ajax({
    url: '/feeds/posts/summary?alt=json&max-results=0&start-index=' + pageToken,
    dataType: 'json',
    success: function(data) {
      if (data.feed.category) {
        allLabels = allLabels.concat(data.feed.category.map(cat => cat.term));
      }
      if (data.feed.openSearch$totalResults.$t > allLabels.length) {
        pageToken = data.feed.openSearch$startIndex.$t + data.feed.openSearch$itemsPerPage.$t;
        fetchLabelsWithToken(pageToken, filterParam);
      } else {
        filterAuthors(filterParam);
      }
    }
  });
}

function filterAuthors(filterParam) {
  var filters = filterParam.split(',').map(f => f.trim().toLowerCase());

  filteredAuthors = allLabels.filter(label => {
    if (!label.startsWith('autor:')) return false;
    var authorName = label.substring(6).toLowerCase();
    return filters.some(filter => authorName.startsWith(filter));
  }).map(label => label.substring(6));

  filteredAuthors = [...new Set(filteredAuthors)];
  filteredAuthors.sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

  displayAuthors();
}

function displayAuthors() {
  var authorsList = '';
  if (filteredAuthors.length > 0) {
    authorsList += '<ul style="padding-left: 20px;">';
    filteredAuthors.forEach(author => {
      authorsList += `<li style="margin-bottom: 5px;"><a href="/p/results.html?autor=${encodeURIComponent(author)}" target="_blank">${author}</a></li>`;
    });
    authorsList += '</ul>';
  } else {
    authorsList += '<p>No se encontraron autores con los filtros proporcionados.</p>';
  }
  $('#authorsList').html(authorsList);
}

$(document).ready(function() {
  var filterParam = $('#authorsList').data('filter');

  if (filterParam) {
    allLabels = [];
    filteredAuthors = [];
    fetchLabels(filterParam);
  } else {
    $('#authorsList').html('<p>No se ha definido ningún filtro.</p>');
  }
});
