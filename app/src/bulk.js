const fs = require('fs');
const LOG_PATH = 'app/log/';
var bulk_data = [];

var prepDataForBulk = function (list, esindex, estype, callback, customize) {
    list.forEach((element, index) => {
        //element['timestamp'] = Date.now();
        element, index = (customize) ? customize(element, index) : element, index
        bulk_data.push(
            { index: { _index: esindex, _type: estype, _id: index } },
            element
        );
    });
    callback(bulk_data);
}


var importData = function (esconnection, data, index, type, callback) {
    //data['crew'] = JSON.parse(data['crew'])
    esconnection.bulk({
        maxRetries: 1,
        index: index,
        type: type,
        body: data
    }, function (err, resp, status) {
        if (err) {
            console.log(err);
        }
        else {
            callback(resp);
        }
    })
}

var bulk = function (esconnection, args, callback) {
    if (args && args['index'] && args['type'] && args['filePath']) {
        const index = args.index;
        const type = args.type;
        const filePath = args.filePath;
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        prepDataForBulk(data, index, type, function (bulkdata) {
            importData(esconnection, bulkdata, index, type, function (response) {
                //console.log('Response', response);                    
                fs.writeFileSync(LOG_PATH + Date.now() + '.json', JSON.stringify(response));

            })
        },
            function (element, index) {
                element['crew'] = JSON.parse(element['crew'])
                return element, element['tconst']
            }
        );
    }
    else {
        console.error('Args empty/incomplete...', args);
    }

}





module.exports = bulk;
