(function () {
    'use strict';

    var listRenderer;
    var headerRenderer;
    var itemRenderer;
    var pageLayout;
    var movies = [];
    var netflixApiPrefix = "http://odata.netflix.com/Catalog/Titles?$filter=substringof('";
    var netflixApiSuffix = "', Name)&$format=json&$top=50";

    // Custom event raised after the fragment is appended to the DOM.
    WinJS.Application.addEventListener('fragmentappended', function handler(e) {
        if (e.location === '/html/landingPage.html') { fragmentLoad(e.fragment, e.state); }
        $("#btnSearch").click(function () {
            var search = document.getElementById("txtSearch").value;
            search = search.replace(' ', '%20');
            var address = netflixApiPrefix + search + netflixApiSuffix;
            WinJS.xhr({ url: address }).then(movieSearchComplete, onApiError);
        });
    });



    function searchClickEventHandler() {
        var search = document.getElementById("txtSearch").value;
        search = search.replace(' ', '%20');
        var address = netflixApiPrefix + search + netflixApiSuffix;
        WinJS.xhr({ url: address }).then(movieSearchComplete, onApiError);
    }

    function movieSearchComplete(data) {
        movies = [];
        var response = JSON.parse(data.response);
        var results = response.d;
        if (results.length > 1) {
            for (var i = 0; i < results.length; i++) {
                var movie = results[i];
                movies[movies.length] = {
                    Name: movie.Name,
                    Synopsis: movie.Synopsis,
                    Id: movie.Id,
                    Url: movie.Url,
                    ImageUrl: movie.BoxArt.LargeUrl,
                    CastUrl: movie.Cast.__deferred.uri
                };
            }
                
            WinJS.UI.setOptions(WinJS.UI.getControl(document.querySelector('.landingList')), {
                dataSource: movies,
                itemRenderer: itemRenderer,
                groupDataSource: null,
                groupRenderer: headerRenderer,
                oniteminvoked: itemInvoked
            });
            return;
        }
    }

    function updateForLayout(lv, layout) {
        pageLayout = layout;
        if (pageLayout === Windows.UI.ViewManagement.ApplicationLayoutState.snapped) {
            WinJS.UI.setOptions(lv, {
                dataSource: movies,
                itemRenderer: listRenderer,
                groupDataSource: null,
                groupRenderer: null,
                oniteminvoked: itemInvoked
            });

            lv.layout = new WinJS.UI.ListLayout();
        } else {
            WinJS.UI.setOptions(lv, {
                dataSource: movies,
                itemRenderer: itemRenderer,
                groupDataSource: null,
                groupRenderer: headerRenderer,
                oniteminvoked: itemInvoked
            });
            lv.layout = new WinJS.UI.GridLayout({ groupHeaderPosition: 'top' });
        }
        lv.refresh();
    }

    function layoutChanged(e) {
        var list = document.querySelector('.landingList');
        if (list) {
            var lv = WinJS.UI.getControl(list);
            updateForLayout(lv, e.layout);
        }
    }

    function fragmentLoad(elements, options) {
        try {
            var appLayout = Windows.UI.ViewManagement.ApplicationLayout.getForCurrentView();
            if (appLayout) {
                appLayout.addEventListener('layoutchanged', layoutChanged);
            }
        } catch (e) { }

        WinJS.UI.processAll(elements)
            .then(function () {
            itemRenderer = elements.querySelector('.itemTemplate');
            headerRenderer = elements.querySelector('.headerTemplate');
            listRenderer = elements.querySelector('.listTemplate');
            var lv = WinJS.UI.getControl(elements.querySelector('.landingList'));
            updateForLayout(lv, Windows.UI.ViewManagement.ApplicationLayout.value);
        });
    }

    function itemInvoked(e) {
        if (pageLayout === Windows.UI.ViewManagement.ApplicationLayoutState.snapped) {
            var item = movies[e.detail.itemIndex];
            WinJS.Navigation.navigate('/html/collectionPage.html', { item: item });
        } else {
            var item = movies[e.detail.itemIndex];
            WinJS.Navigation.navigate('/html/detailPage.html', { item: item });
        }
    }

    // The getGroups() and getItems() functions contain sample data.
    // TODO: Replace with custom data.
    function getGroups() {
        var colors = ['rgba(209, 211, 212, 1)', 'rgba(147, 149, 152, 1)', 'rgba(65, 64, 66, 1)'];
        var groups = [];

        for (var i = 0; i < 6; i++) {
            var even = (i % 2) === 0;
            groups.push({
                key: 'group' + i,
                title: 'Collection title lorem ' + i,
                backgroundColor: colors[i % colors.length],
                label: 'Eleifend posuere',
                description: even ? 'ǺSed nisl nibh, eleifend posuere.' : 'ǺSed nisl nibh, eleifend posuere laoreet egestas, porttitor quis lorem.',
                fullDescription: 'Ǻ Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum.' + (even ? '' : ' Ǻ Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum.')
            });
        }

        return groups;
    }

    function getItems() {
        var colors = ['rgba(209, 211, 212, 1)', 'rgba(147, 149, 152, 1)', 'rgba(65, 64, 66, 1)'];
        var items = [];

        for (var g = 0, gl = pageData.groups.length; g < gl; g++) {
            var numItems = g % 2 === 0 ? 6 : 4;
            for (var i = 0; i < numItems; i++) {
                items.push({
                    group: pageData.groups[g],
                    key: 'item' + i,
                    title: g + '.' + i + (i % 2 === 0 ? ' ǺSed nisl nibh, eleifend posuere.' : ' ǺSed nisl nibh, eleifend posuere laoreet egestas, porttitor quis lorem.'),
                    subtitle: 'Phasellus faucibus',
                    backgroundColor: colors[i % colors.length],
                    content: (new Array(16)).join('<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Typi non habent claritatem insitam; est usus legentis in iis qui facit eorum claritatem. Investigationes demonstraverunt lectores legere me lius quod ii legunt saepius. Claritas est etiam processus dynamicus, qui sequitur mutationem consuetudium lectorum. Mirum est notare quam littera gothica, quam nunc putamus parum claram, anteposuerit litterarum formas humanitatis per seacula quarta decima et quinta decima. Eodem modo typi, qui nunc nobis videntur parum clari, fiant sollemnes in futurum.</p>'),
                    description: 'Ǻ Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.'
                });
            }
        }

        return items;
    }

    var pageData = {};
    pageData.groups = getGroups();
    pageData.items = getItems();

    WinJS.Namespace.define('landingPage', {
        fragmentLoad: fragmentLoad,
        itemInvoked: itemInvoked
    });
})();
