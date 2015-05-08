var gs = require('./config/gs.js');
var osm = require('./config/osm.js');

module.exports = function (scraper, db) {
  scraper.dataNow = function(io) {
    db.collection('raw_data').find().toArray(function(err, result) {
      names = result.map(function(obj) { return obj.name });
      osm.fetchInstant(io, names, function() {
        setTimeout(function() {
          scraper.dataNow(io);
        }, 200);
      });
    });
  };

  scraper.refreshData = function() {
    console.log('refreshing data');
    gs.getUsers(function(names) {
      uniqueNames = names.filter(function(item, pos) {
        return names.indexOf(item) == pos;
      });
      osm.fetchData(uniqueNames, function(users) {
        for (var i = 0; i < users.length-1; i++) {
          if (users[i]) {
            db.collection('raw_data').save(users[i], function(err, result) {});
            console.log('saved to db');
          }
        }
        scraper.analyzeData(users);
        scraper.refreshData();
      });
    });
  };

  scraper.analyzeData = function (array) {
    users = array.sort(function(a, b) {
      var keyA = a.edits;
      var keyB = b.edits;
      if(keyA > keyB) return -1;
      if(keyA < keyB) return 1;
      return 0;
    });

    totalCount = 0;
    totalEdits = 0;
    for (var i = 0; i < users.length; i++) {
      if (users[i] && users[i].count) {
        totalCount += users[i].count;
      }
      if (users[i] && users[i].edits) {
        totalEdits += users[i].edits;
      }
    }

    var data = {
      _id: 1,
      leaderboard: [
        { name: users[0].name, count: users[0].edits },
        { name: users[1].name, count: users[1].edits },
        { name: users[2].name, count: users[2].edits },
        { name: users[3].name, count: users[3].edits },
        { name: users[4].name, count: users[4].edits },
        { name: users[5].name, count: users[5].edits },
        { name: users[6].name, count: users[6].edits },
        { name: users[7].name, count: users[7].edits },
        { name: users[8].name, count: users[8].edits },
        { name: users[9].name, count: users[9].edits },
      ],
      stats: {
        totalUsers: users.length,
        totalCount: totalCount,
        totalEdits: totalEdits
      }
    };

    db.collection('statistics').save(data, function(err, result) {

    });
    console.log(data);
  }
};
