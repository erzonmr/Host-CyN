var allLabels = [];
var filteredAuthors = [];

// Esta función hace la solicitud de etiquetas (labels) y luego las filtra según los criterios pasados
function fetchLabels(criteria) {
  $.ajax({
    url: '/feeds/posts/summary?alt=json&max-results=0',
    dataType: 'json',
    success: function(data) {
      if (data.feed.category) {
        allLabels = allLabels.concat(data.feed.category.map(cat => cat.term));
      }
      if (data.feed.openSearch$totalResults.$t > allLabels.length) {
        var pageToken = data.feed.openSearch$startIndex.$t + data.feed.openSearch$itemsPerPage.$t;
        fetchLabelsWithToken(pageToken, criteria);
      } else {
        filterAuthors(criteria);
      }
    }
  });
}

function fetchLabelsWithToken(pageToken, criteria) {
  $.ajax({
    url: '/feeds/posts/summary?alt=json&max-results=0&start-index=' + pageToken,
    dataType: 'json',
    success: function(data) {
      if (data.feed.category) {
        allLabels = allLabels.concat(data.feed.category.map(cat => cat.term));
      }
      if (data.feed.openSearch$totalResults.$t > allLabels.length) {
        pageToken = data.feed.openSearch$startIndex.$t + data.feed.openSearch$itemsPerPage.$t;
        fetchLabelsWithToken(pageToken, criteria);
      } else {
        filterAuthors(criteria);
      }
    }
  });
}

function filterAuthors(criteria) {
  // Filtramos etiquetas que comiencen con 'autor:' y que coincidan con alguno de los criterios
  filteredAuthors = allLabels.filter(label => {
    if (!label.startsWith('autor:')) return false;
    var authorName = label.substring(6); // Eliminar el prefijo 'autor:'
    return criteria.some(criterion => 
      authorName.toLowerCase().startsWith(criterion.toLowerCase()) || 
      authorName.toLowerCase().startsWith(removeAccents(criterion.toLowerCase()))
    );
  }).map(label => label.substring(6)); // Remover 'autor:'

  // Remover duplicados
  filteredAuthors = [...new Set(filteredAuthors)];

  // Ordenar: Si comienza con números, ordena numéricamente, sino alfabéticamente
  filteredAuthors.sort((a, b) => {
    const isANumeric = /^\d/.test(a);
    const isBNumeric = /^\d/.test(b);
    if (isANumeric && isBNumeric) {
      return parseInt(a) - parseInt(b);
    }
    return a.localeCompare(b, 'es', { sensitivity: 'base' });
  });

  displayAuthors(criteria);
}

function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function displayAuthors(criteria) {
  var authorsList = `<h2>Autores filtrados por: ${criteria.join(', ')}</h2>`;
  if (filteredAuthors.length > 0) {
    authorsList += '<ul style="list-style-type: none; padding-left: 0;">';
    filteredAuthors.forEach(author => {
      authorsList += `<li style="margin-bottom: 5px;">• <a href="/p/results.html?autor=${encodeURIComponent(author)}" target="_blank">${author}</a></li>`;
    });
    authorsList += '</ul>';
  } else {
    authorsList += '<p>No se encontraron autores con los criterios especificados.</p>';
  }
  $('#authorsList').html(authorsList);
}

// Esta función se ejecuta automáticamente con los criterios definidos en el backend o HTML
function loadAuthors(criteria) {
  fetchLabels(criteria);
}
