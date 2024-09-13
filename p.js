function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function loadAuthorPosts(author) {
  $.ajax({
    url: `/feeds/posts/default/-/autor:${author}?alt=json-in-script&max-results=500`,
    dataType: 'jsonp',
    success: function(data) {
      displayAuthorPosts(data, author);
    },
    error: function() {
      $('#songsList').html('<p>Error al cargar las canciones. Intenta nuevamente más tarde.</p>');
    }
  });
}

function displayAuthorPosts(json, author) {
  var postList = `<h2>Canciones de ${author}</h2>`;
  if (json.feed.entry && json.feed.entry.length > 0) {
    var songs = json.feed.entry.map(entry => ({
      title: entry.title.$t,
      url: entry.link.find(link => link.rel === 'alternate').href
    }));
    
    songs.sort((a, b) => a.title.localeCompare(b.title, 'es', { sensitivity: 'base' }));

    var listItems = songs.map(song => `<li style="margin-bottom: 5px;">• <a href="${song.url}">${song.title}</a></li>`).join('');
    postList += `<ul style="list-style-type: none; padding-left: 0;">${listItems}</ul>`;
  } else {
    postList += '<p>No se encontraron canciones para este autor.</p>';
  }
  $('#songsList').html(postList);
}

$(document).ready(function() {
  var author = getUrlParameter('autor');
  if (author && /^[a-zA-Z0-9 ]+$/.test(author)) {
    loadAuthorPosts(author);
  } else {
    $('#songsList').html('<p>El nombre del autor no es válido o no se especificó ningún autor.</p>');
  }
});
