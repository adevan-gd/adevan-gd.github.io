/* global document */

var searchData;
var searchId = 'f73c3473-f750-4298-bb07-3837be4f2c2bff66efc0-857b-4d13-930d-9e8db5ae4338';
var searchHash = '#' + searchId;

function hideSearch() {
  var container = document.querySelector('#search-container');

  // eslint-disable-next-line no-undef
  if (window.location.hash === searchHash ) {
    // eslint-disable-next-line no-undef
    history.go(-1);
  }

  // eslint-disable-next-line no-undef
  window.onhashchange = null;

  if (container) {
    container.style.display = 'none';
  }
}

function listenKey(event) {
  if (event.key === 'Escape') {
    hideSearch();
    // eslint-disable-next-line no-undef
    window.removeEventListener('keyup', listenKey);
  }
}

function showSearch() {
  var container = document.querySelector('#search-container');
  var input = document.querySelector('#search-input');

  // eslint-disable-next-line no-undef
  window.onhashchange = hideSearch;

  // eslint-disable-next-line no-undef
  if (window.location.hash !== searchHash) {
    // eslint-disable-next-line no-undef
    history.pushState(null, null, searchHash);
  }

  if (container) {
    container.style.display = 'flex';
    // eslint-disable-next-line no-undef
    window.addEventListener('keyup', listenKey);
  }

  if (input) {
    input.focus();
  }
}

function fetchAllData(obj = {}) {
  // eslint-disable-next-line no-undef
  var url = baseURL + 'data/search.json';

  fetch(url)
    .then(function(d) {
      return d.json();
    })
    .then(function(d) {
      searchData = d.list;
      if (typeof obj.onSuccess === 'function') {
        obj.onSuccess(d.list);
      }
    })
    .catch(function(error) {
      console.error(error);
      if (typeof obj.onError === 'function') {
        obj.onError();
      }
    });
}

function buildSearchResult(result) {
  var output = '';

  for (const res of result) {
    var data = res.item;
    var link = res.item.link.replace('<a href="', '').replace(/">.*/, '');

    output += `

    <a href="${link}" class="search-result-item">
      <div class="search-result-item-title">
          ${data.title}
      </div>
      <div class="search-result-item-p">
          ${data.description ? data.description : 'No description available.'}
      </div>
    </a>
    `;
  }

  return output;
}

function getSearchResult(list, keys, searchKey) {
  var defaultOptions = {
    shouldSort: true,
    threshold: 0.4,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: keys
  };

  // var op = Object.assign({}, defaultOptions, options);
  var op = defaultOptions;

  // eslint-disable-next-line no-undef
  var searchIndex = Fuse.createIndex(op.keys, list);

  /* eslint-disable-next-line */
    var fuse = new Fuse(list, op, searchIndex);

  var result = fuse.search(searchKey);

  if (result.length > 20) {
    result = result.slice(0, 20);
  }

  return result;
}

function debounce(func, wait, immediate) {
  var timeout;

  return function() {
    // eslint-disable-next-line consistent-this, no-invalid-this
    var context = this,
      args = arguments;

    clearTimeout(timeout);
    timeout = setTimeout(function() {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    }, wait);
    if (immediate && !timeout) {
      func.apply(context, args);
    }
  };
}

function search(event) {
  var value = event.target.value;
  var resultBox = document.querySelector('#search-result-c');
  var keys = ['title', 'description'];

  if (!resultBox) {
    console.error('Search result container not found');

    return;
  }

  if (!value) {
    resultBox.innerHTML = 'Type anything to view search result';

    return;
  }

  function onSuccess(res) {
    if (res.length === 0) {
      resultBox.innerHTML =
                'No result found! Try some different combination.';

      return;
    }
    var output = buildSearchResult(res);

    resultBox.innerHTML = output;
  }

  if (!searchData) {
    resultBox.innerHTML = 'Loading...';

    fetchAllData({
      onSuccess: function(list) {
        console.log('Onsucess');
        var result = getSearchResult(list, keys, value);

        onSuccess(result);
      },
      onError: function() {
        resultBox.innerHTML = 'Failed to load result.';
      }
    });

    return;
  }

  var result = getSearchResult(searchData, keys, value);

  onSuccess(result);
}

function onDomContentLoaded() {
  var input = document.querySelector('#search-input');
  var searchButton = document.querySelectorAll('.search-button');
  var searchContainer = document.querySelector('#search-container');
  var searchWrapper = document.querySelector('#search-wrapper');
  var searchCloseButton = document.querySelector('#search-close-button');

  var debouncedSearch = debounce(search, 300);

  if (searchCloseButton) {
    searchCloseButton.addEventListener('click', hideSearch);
  }

  if (searchButton) {
    searchButton.forEach(function(item) {
      item.addEventListener('click', showSearch);
    });
  }

  if (searchContainer) {
    searchContainer.addEventListener('click', hideSearch);
  }

  if (searchWrapper) {
    searchWrapper.addEventListener('click', function(event) {
      event.stopPropagation();
    });
  }

  if (input) {
    input.addEventListener('keyup', debouncedSearch);
  }
}

// eslint-disable-next-line no-undef
window.addEventListener('DOMContentLoaded', onDomContentLoaded);

// eslint-disable-next-line no-undef
window.addEventListener('hashchange', function() {
  // eslint-disable-next-line no-undef
  if (window.location.hash === searchHash) {
    showSearch();
  }
});
