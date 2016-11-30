// ================= functions =================

function data_link(){
  var muni = $('#muni').is(':checked');
  var bounds = map.getBounds();
  var bstr = 'nelat=' + bounds.getNorthEast().lat() + '&nelng=' + bounds.getNorthEast().lng() +
         '&swlat=' + bounds.getSouthWest().lat() + '&swlng=' + bounds.getSouthWest().lng();
  var mstr = 0;
  if(muni) mstr = 1;
  return '/locations/data.csv?muni=' + mstr + '&' + bstr;
}

function update_permalink(){
  var center = map.getCenter();
  var typeid = map.getMapTypeId();
  var zoom = map.getZoom();
  var permalink = '/?z=' + zoom + '&y=' + sprintf('%.05f',center.lat()) +
    '&x=' + sprintf('%.05f',center.lng()) + '&m=' + $('#muni').is(":checked") + "&t=" +
     typeid + '&l=' + $('#labels').is(":checked") + '&locale=' + I18n.locale;
  if (type_filter && type_filter.length) {
  	permalink += "&f=" + compress_integers(type_filter);
  }
  // if (cats != undefined){
  //   permalink += "&c=" + cats;
  // }
  $('#permalink').attr('href',permalink);
}

// Converts integers to compact string
// NOTE: Integers are sorted first for better compression.
// TODO: Use bitmap of string lengths instead of divider?
function compress_integers(x) {
  // Sort numbers
  x = x.sort(function(a, b) {
    return a - b;
  });
  // Convert numbers to range endpoints
  var ranges = [], rstart, rend;
  for (var i = 0; i < x.length; i++) {
    rstart = x[i];
    rend = rstart;
    while (x[i + 1] - x[i] == 1) {
      rend = x[i + 1]; // increment the index if the number is sequential
      i++;
    }
    if (rstart == rend) {
      ranges.push(rstart, rstart);
    } else {
      ranges.push(rstart, rend);
    }
  }
  // Convert to delta sequence
  var seq = [ranges[0]];
  for (var i = 1; i < ranges.length; i++) {
    seq.push(ranges[i] - ranges[i - 1]);
  }
  // Base 64 radix string
  var str = "";
  for (var i = 0; i < seq.length; i++) {
    str += (seq[i] > 63 || seq[i] < 0) ? "|" + Base64.fromInt(seq[i]) + "|" : Base64.fromInt(seq[i]);
  }
  // Concatenate strings
  return str;
}

// Recovers integers from output of compress_integers()
function unpack_integers(str) {
  // Decode base 64 to delta sequence
  var seq = [], i = 0;
  while (i < str.length) {
    if (str[i] == "|") {
      var temp = ""; i++;
      while (str[i] != "|") {
        temp += str[i];
        i++;
      }
      seq.push(Base64.toInt(temp));
    } else {
      seq.push(Base64.toInt(str[i]));
    }
    i++;
  }
  // Convert to range endpoints
  for (var i = 1; i < seq.length; i++) {
    seq[i] = seq[i - 1] + seq[i];
  }
  // Expand range endpoints
  var x = [];
  for (var i = 0; i < seq.length; i = i + 2) {
    for (var j = seq[i]; j <= seq[i + 1]; j++) {
      x.push(j);
    }
  }
  return x;
}

// Encode integers as 64-radix strings
// http://stackoverflow.com/a/27696695
Base64 = (function () {
  var digitsStr =
  //   0       8       16      24      32      40      48      56     63
  //   v       v       v       v       v       v       v       v      v
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-";
  var digits = digitsStr.split('');
  var digitsMap = {};
  for (var i = 0; i < digits.length; i++) {
    digitsMap[digits[i]] = i;
  }
  return {
    fromInt: function(int32) {
      var result = '';
      while (true) {
        result = digits[int32 & 0x3f] + result;
        int32 >>>= 6;
        if (int32 === 0)
          break;
      }
      return result;
    },
    toInt: function(digitsStr) {
      var result = 0;
      var digits = digitsStr.split('');
      for (var i = 0; i < digits.length; i++) {
        result = (result << 6) + digitsMap[digits[i]];
      }
      return result;
    }
  };
})();

function update_url(object) {
  window.history.pushState(undefined, "", $(object).attr('href'));
}

function show_embed_html(object){
  var center = map.getCenter();
  var typeid = map.getMapTypeId();
  var zoom = map.getZoom();
  var http = location.protocol;
  var slashes = http.concat("//");
  var host = slashes.concat(window.location.hostname);
  if (type_filter && type_filter.length) {
  	var fstr = "&f=" + compress_integers(type_filter);
  } else {
    var fstr = "";
  }
  // if (cats != undefined) {
  //   var cstr = "&c=" + cats;
  // } else {
  //   var cstr = "";
  // }
  $(object).text('<iframe src="' + host + '/locations/embed?z=' + zoom + '&y=' + sprintf('%.05f',center.lat()) +
    '&x=' + sprintf('%.05f',center.lng()) + '&m=' + $('#muni').is(":checked") + "&t=" + typeid + fstr +
    '&l=' + $('#labels').is(":checked") + '&locale=' + I18n.locale +
    '" width=640 height=600 scrolling="no" style="border:none;"></iframe>').dialog({
      closeText: "close",
      modal: true,
      width: 'auto',
      minHeight: '5em',
      resizable: false,
      draggable: false,
      dialogClass: "dialog_grey"
    });
}

function show_observation_html(object){
  var center = map.getCenter();
  var typeid = map.getMapTypeId();
  var zoom = map.getZoom();
  var http = location.protocol;
  var slashes = http.concat("//");
  var host = slashes.concat(window.location.hostname);
  $(object).text('<iframe src="' + host + '/locations/embed?z=' + zoom + '&y=' + sprintf('%.05f',center.lat()) +
    '&x=' + sprintf('%.05f',center.lng()) + '&m=' + $('#muni').is(":checked") + "&t=" + typeid +
    '" width=640 height=600 scrolling="no" style="border:none;"></iframe>').dialog({
      closeText: "close",
      modal: true,
      width: 'auto',
      minHeight: '5em',
      resizable: true,
      draggable: false,
      dialogClass: "dialog_grey"
    });
}

function update_display(force,force_zoom,force_bounds){
  var zoom = map.getZoom();
  if (force_zoom != undefined) zoom = force_zoom;
  var bounds = map.getBounds();
  if (force_bounds != undefined) bounds = force_bounds;
  var muni = $('#muni').is(':checked');
  update_permalink();
  if (zoom <= 12) {
    if (prior_zoom > 12) hide_map_controls();
    do_clusters(bounds, zoom, muni, type_filter);
    update_types_hash(bounds, zoom, muni);
  } else if (zoom >= 13) {
    if (prior_zoom < 13) {
      types_hash = {};
      show_map_controls();
    }
    do_markers(bounds, skip_ids, muni, type_filter, $('#invasive').is(':checked'));
  }
  prior_zoom = zoom;
  prior_bounds = bounds;
}

function hide_map_controls() {
  $('#hidden_controls').hide();
  $('#export_data').hide();
  $('#invasive_span').hide();
  resize_map();
}

function show_map_controls() {
  $('#get_data_link').attr('href',data_link());
  $('#hidden_controls').show();
  $('#export_data').show();
  $('#invasive_span').show();
	resize_map();
}

function resize_map() {
  if(document.getElementById('searchbar') == undefined) return;
  var headerHeight = document.getElementById('searchbar').offsetHeight + document.getElementById('menubar').offsetHeight + document.getElementById('logobar').offsetHeight;
	if (document.getElementById('mainmap_container') != undefined) {
		document.getElementById('mainmap_container').style.top = headerHeight + 'px';
	}
	if (document.getElementById('sidebar_container') != undefined) {
		document.getElementById('sidebar_container').style.top = headerHeight + 'px';
	}
}

function update_display_embedded(force, force_zoom, muni) {
  var zoom = map.getZoom();
  if(force_zoom != undefined) zoom = force_zoom;
  var bounds = map.getBounds();
  var center = map.getCenter();
  if (zoom <= 12) {
    do_clusters(bounds, zoom, muni, type_filter);
  } else if (zoom >= 13) {
    do_markers(bounds, null, muni, type_filter, false);
  }
  prior_zoom = zoom;
  prior_bounds = bounds;
}

/*** Sidebar ***/

function open_sidebar() {
  $('#sidebar_button').hide();
  $('#mainmap_container').css('left','400px');
  google.maps.event.trigger(map,'resize');
}

function close_sidebar() {
  $('#mainmap_container').css('left','0px');
  $('#sidebar_button').show();
  google.maps.event.trigger(map, 'resize');
}

/*** Type filter ***/

var type_tree = [];
var type_tree_root = [];
var type_nodes = [];
var previous_type_search = null;

function load_type_tree(element, tree_data) {
  $.ui.dynatree.nodedatadefaults["icon"] = false;
  $.ui.dynatree.nodedatadefaults["select"] = true;
  $.ui.dynatree.nodedatadefaults["expand"] = true;
  element.dynatree({
    checkbox: false,
    selectMode: 3,
    persist: false,
    autoFocus: false,
    children: tree_data,
    generateIds: false, // Generate id attributes like <span id='IDPREFIX-KEY'>
    idPrefix: "typetree-id-",
    cookieId: "typetree", // Choose a more unique name, to allow multiple trees.
    cookie: {
      expires: null // Days or Date; null: session cookie
    },
    onFocus: function (node) {
      node.activate();
    },
    // onSelect: function (select, node) {
    // },
    onClick: function (node, event) {
      if (node.getEventTargetType(event) != 'expander') {
        node.toggleSelect();
      }
    },
    onKeydown: function (node, event) {
      if (event.which == 32) {
        node.toggleSelect();
        return false;
      }
    },
    classNames: {
      container: "dynatree-container",
      node: "dynatree-node",
      folder: "dynatree-folder",
      empty: "dynatree-empty",
      vline: "dynatree-vline",
      expander: "dynatree-expander",
      connector: "dynatree-connector",
      checkbox: "dynatree-checkbox",
      nodeIcon: "dynatree-icon",
      title: "dynatree-title",
      noConnector: "dynatree-no-connector",
      nodeError: "dynatree-statusnode-error",
      nodeWait: "dynatree-statusnode-wait",
      hidden: "dynatree-hidden",
      combinedExpanderPrefix: "dynatree-exp-",
      combinedIconPrefix: "dynatree-ico-",
      hasChildren: "dynatree-has-children",
      active: "dynatree-active",
      selected: "dynatree-selected",
      expanded: "dynatree-expanded",
      lazy: "dynatree-lazy",
      focused: "dynatree-focused",
      partsel: "dynatree-partsel",
      lastsib: "dynatree-lastsib"
    },
    onPostInit: function() {
      type_tree = $("#type_tree").dynatree("getTree");
      type_tree_root = $("#type_tree").dynatree("getRoot");
      update_tree_from_type_filter(type_filter);
      // Load with active node focused (when loading state from cookie)
      var node = element.dynatree("getActiveNode");
      if (node != null) {
        node.focus();
      }
    },
    onRender: function(node, nodeSpan) {
      if (node.hidden) {
        $(nodeSpan).addClass("hidden");
      }
      if (node.unavailable) {
        $(nodeSpan).addClass("unavailable");
      }
    }
  });
}

function expand_all() {
  type_tree_root.visit(function (node) {
    if (!node.isExpanded()) {
      node.expand(true);
    }
  });
}

function collapse_all() {
  type_tree_root.visit(function (node) {
    if (node.isExpanded()) {
      node.expand(false);
    }
  });
}

function select_all() {
  type_tree_root.visit(function (node) {
    if (!node.isSelected()) {
      node.select(true);
    }
  });
}

function deselect_all() {
  type_tree_root.visit(function (node) {
    if (node.isSelected()) {
      node.select(false);
    }
  });
}

function hide_unselected() {
  function f(nodes) {
    for (var i = nodes.length; i--;) {
      if (nodes[i].hidden || nodes[i].unavailable) {
        continue
      }
      if (!nodes[i].hasSubSel && !nodes[i].bSelected) {
        $(nodes[i].li.firstChild).addClass('hidden');
        nodes[i].hidden = true;
      }
      if (nodes[i].hasChildren()) {
        f(nodes[i].getChildren());
      }
    }
  }
  f(type_tree_root.getChildren());
}

function show_unselected() {
  function f(nodes) {
    for (var i = nodes.length; i--;) {
      if (nodes[i].unavailable) {
        continue
      }
      if (!nodes[i].hasSubSel && !nodes[i].bSelected) {
        $(nodes[i].li.firstChild).removeClass('hidden');
        nodes[i].hidden = false;
      }
      if (nodes[i].hasChildren()) {
        f(nodes[i].getChildren());
      }
    }
  }
  f(type_tree_root.getChildren());
}

function update_map_from_tree() {
  type_filter = $.map(type_tree.getSelectedNodes(), function(node) {
    key = node.data.key;
    if (/^[0-9]/.test(key)) {
      return parseInt(key);
    }
  });
  if (map.getZoom() <= 12) {
    update_display();
  } else {
    apply_type_filter();
  }
  update_permalink();
}

function update_tree_from_map() {
  ids = Object.keys(types_hash);
  function f(nodes) {
    var available_children = 0;
    for (var i = nodes.length; i--;) {
      var available = (nodes[i].hasChildren() && f(nodes[i].getChildren())) || types_hash[nodes[i].data.key];
      if (available) {
        nodes[i].unavailable = false;
        nodes[i].data.title = nodes[i].data.title.replace(/$| \([0-9]+\)$/, " (" + available + ")");
        available_children += available;
        nodes[i].render();
      } else {
        $(nodes[i].li.firstChild).addClass("unavailable");
        nodes[i].unavailable = true;
      }
    }
    return(available_children);
  }
  f(type_tree_root.getChildren());
}

function update_tree_from_type_filter(type_filter) {
  type_tree_root.visit(function (node) {
    if (type_filter.includes(parseInt(node.data.key))) {
      if (!node.isSelected()) {
        node.select(true);
      }
    } else {
      if (node.isSelected()) {
        node.select(false);
      }
    }
  });
}

function search_tree(e) {
  var search = e.value.trim().toLowerCase();
  var is_subset_search = search.indexOf(previous_type_search) >= 0;
  var is_new_search = previous_type_search == "" || previous_type_search == null;
  if (!search.length || !is_subset_search) {
    // Reset
    type_tree_root.visit(function(node) {
      // Show those previously hidden
      if (node.previouslyVisible) {
        $(node.li.firstChild).removeClass('hidden');
        node.hidden = false;
      }
      // Close those previously expanded
      if (node.previouslyClosed) {
        node.expand(false);
      }
    });
    if (!search.length) {
      // Reset search sequence and exit
      previous_type_search = null;
      return;
    }
  }
  function f(nodes, select_first_child = false) {
    var available_children = false;
    for (var i = nodes.length; i--;) {
      // If subset search, skip those already hidden
      // Alternate to classes: $(nodes.li).css('display') == 'none'
      if (is_subset_search && (nodes[i].unavailable || nodes[i].hidden)) {
        continue;
      }
      var is_available_root = nodes[i].data.title.toLowerCase().indexOf(search) >= 0 || (i == 0 && select_first_child);
      var has_available_children = (nodes[i].hasChildren() && f(nodes[i].getChildren(), is_available_root));
      if (has_available_children) {
        if (is_new_search && !nodes[i].isExpanded()) {
          // Save expansion state
          nodes[i].previouslyClosed = true;
        }
        nodes[i].expand(true);
      }
      if (has_available_children || is_available_root) {
        if (!available_children) {
          available_children = true;
        }
      } else {
        // Save visibility state
        nodes[i].previouslyVisible = true;
        $(nodes[i].li.firstChild).addClass('hidden');
        nodes[i].hidden = true;
      }
    }
    return(available_children);
  }
  f(type_tree_root.getChildren());
  previous_type_search = search;
}
