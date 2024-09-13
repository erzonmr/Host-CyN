// Variables globales para las etiquetas y los autores filtrados
var allLabels = [];
var filteredAuthors = [];

// Obtener los criterios predefinidos del atributo data-filter en el HTML
var predefinedFilterCriteria = $('#filterCriteriaContainer').data('filter').split(',').map(c => c.trim());

function fetchLabels() {
  $.ajax({
    url: '/feeds/posts/summary?alt=json&max-results=0',
    dataType: 'json',
    success: function(data) {
      if (data.feed.category) {
        allLabels = allLabels.concat(data.feed.category.map(cat => cat.term));
      }
      if (data.feed.openSearch$totalResults.$t > allLabels.length) {
        var pageToken = data.feed.openSearch$startIndex.$t + data.feed.openSearch$itemsPerPage.$t;
        fetchLabelsWithToken(pageToken);
      } else {
        filterAuthors();
      }
    }
  });
}

function fetchLabelsWithToken(pageToken) {
  $.ajax({
    url: '/feeds/posts/summary?alt=json&max-results=0&start-index=' + pageToken,
    dataType: 'json',
    success: function(data) {
      if (data.feed.category) {
        allLabels = allLabels.concat(data.feed.category.map(cat => cat.term));
      }
      if (data.feed.openSearch$totalResults.$t > allLabels.length) {
        pageToken = data.feed.openSearch$startIndex.$t + data.feed.openSearch$itemsPerPage.$t;
        fetchLabelsWithToken(pageToken);
      } else {
        filterAuthors();
      }
    }
  });
}

// Función para filtrar autores según las letras o números predefinidos
function filterAuthors() {
  var criteria = predefinedFilterCriteria.map(c => c.toLowerCase());
  
  // Filtrar etiquetas que empiecen con alguno de los criterios especificados
  filteredAuthors = allLabels.filter(label => {
    if (!label.startsWith('autor:')) return false;
    var authorName = label.substring(6).toLowerCase(); // Quitar prefijo 'autor:'
    
    // Revisar si el nombre del autor comienza con alguno de los criterios predefinidos (letras/números)
    return criteria.some(c => authorName.startsWith(c) || authorName.startsWith(removeAccents(c)));
  }).map(label => label.substring(6)); // Eliminar prefijo 'autor:'

  // Eliminar duplicados
  filteredAuthors = [...new Set(filteredAuthors)];

  // Ordenar alfabéticamente o numéricamente según el caso
  filteredAuthors.sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

  displayAuthors();
}

// Función para remover acentos de los nombres
function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Mostrar la lista de autores filtrados
function displayAuthors() {
  var filterCriteria = predefinedFilterCriteria.join(', ');
  var authorsList = `<h2>Autores que empiezan por "${filterCriteria}"</h2>`;
  
  if (filteredAuthors.length > 0) {
    authorsList += '<ul style="list-style-type: none; padding-left: 0;">';
    filteredAuthors.forEach(author => {
      authorsList += `<li style="margin-bottom: 5px;">• <a href="/p/results.html?autor=${encodeURIComponent(author)}" target="_blank">${author}</a></li>`;
    });
    authorsList += '</ul>';
  } else {
    authorsList += '<p>No se encontraron autores que empiecen con los criterios especificados.</p>';
  }
  
  $('#authorsList').html(authorsList);
}

// Inicializar la aplicación y cargar etiquetas automáticamente
$(document).ready(function() {
  fetchLabels(); // Recargar etiquetas y aplicar filtro predefinido
});
