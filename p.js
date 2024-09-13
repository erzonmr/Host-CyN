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
  // Convertir el filtro en un array de letras/números
  var filters = filterParam.split(',').map(f => f.trim().toLowerCase());

  // Filtrar autores según las letras o números ingresados
  filteredAuthors = allLabels.filter(label => {
    if (!label.startsWith('autor:')) return false;
    var authorName = label.substring(6).toLowerCase(); // Remueve 'autor:' y convierte a minúsculas

    // Filtra por las letras o números proporcionados
    return filters.some(filter => authorName.startsWith(filter));
  }).map(label => label.substring(6)); // Eliminar prefijo 'autor:'

  // Remover duplicados
  filteredAuthors = [...new Set(filteredAuthors)];

  // Ordenar alfabéticamente
  filteredAuthors.sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

  // Mostrar autores en el DOM
  displayAuthors();
}

function displayAuthors() {
  var authorsList = `<h2>Autores filtrados</h2>`;
  if (filteredAuthors.length > 0) {
    authorsList += '<ul style="list-style-type: none; padding-left: 0;">';
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
  // Obtener el valor de filtro desde el atributo data del div
  var filterParam = $('#authorsList').data('filter');
  
  if (filterParam) {
    allLabels = [];  // Reiniciar lista de etiquetas
    filteredAuthors = [];
    fetchLabels(filterParam); // Iniciar la búsqueda con el filtro proporcionado
  } else {
    $('#authorsList').html('<p>No se ha definido ningún filtro.</p>');
  }
});
