/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.99664350686403, "KoPercent": 0.003356493135971537};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9999664350686402, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "02 Listar mis expedientes"], "isController": false}, {"data": [1.0, 500, 1500, "12 Bandeja del despacho"], "isController": false}, {"data": [1.0, 500, 1500, "11 Login analista"], "isController": false}, {"data": [1.0, 500, 1500, "03 Crear expediente"], "isController": false}, {"data": [1.0, 500, 1500, "13 Documentos del expediente"], "isController": false}, {"data": [1.0, 500, 1500, "06 Verificaciones (cliente)"], "isController": false}, {"data": [0.9993887530562348, 500, 1500, "16 Historial del expediente"], "isController": false}, {"data": [1.0, 500, 1500, "14 Registrar verificación TE (simulada)"], "isController": false}, {"data": [1.0, 500, 1500, "01 Login cliente"], "isController": false}, {"data": [1.0, 500, 1500, "05 Estado del expediente"], "isController": false}, {"data": [1.0, 500, 1500, "04 Adjuntar documento"], "isController": false}, {"data": [1.0, 500, 1500, "15 Verificaciones del expediente"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 29793, 1, 0.003356493135971537, 21.408585909441726, 2, 116, 10.0, 66.0, 70.0, 77.0, 249.222043766312, 395.3133724559577, 80.54903065241669], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["02 Listar mis expedientes", 3336, 0, 0.0, 28.485011990407656, 20, 66, 27.0, 36.0, 40.0, 49.0, 28.056483015567313, 173.45783728385743, 5.89076547690134], "isController": false}, {"data": ["12 Bandeja del despacho", 1671, 0, 0.0, 27.75104727707961, 20, 65, 27.0, 34.0, 38.0, 46.0, 14.06092224840121, 86.93084254564961, 2.9522444173889264], "isController": false}, {"data": ["11 Login analista", 1679, 0, 0.0, 67.18642048838596, 57, 116, 66.0, 74.0, 77.0, 88.20000000000005, 14.045507779822653, 9.32709501003848, 4.254745731031454], "isController": false}, {"data": ["03 Crear expediente", 3316, 0, 0.0, 9.719240048250914, 5, 35, 9.0, 12.0, 14.0, 21.0, 28.019299179531377, 18.38746704605947, 7.825702700533178], "isController": false}, {"data": ["13 Documentos del expediente", 1660, 0, 0.0, 5.828915662650598, 3, 27, 5.0, 8.0, 10.0, 16.389999999999873, 14.026904617048604, 9.042610287593794, 3.342348365781113], "isController": false}, {"data": ["06 Verificaciones (cliente)", 3265, 0, 0.0, 5.832771822358355, 3, 29, 5.0, 8.0, 10.0, 14.0, 27.956639380758297, 12.94386817620389, 6.7707486000274], "isController": false}, {"data": ["16 Historial del expediente", 1636, 1, 0.061124694376528114, 5.778117359413207, 2, 26, 5.0, 8.0, 10.0, 15.0, 14.013928268560317, 7.296032188776865, 3.3235381233885266], "isController": false}, {"data": ["14 Registrar verificación TE (simulada)", 1653, 0, 0.0, 10.999395039322456, 7, 53, 10.0, 14.0, 16.0, 25.0, 14.022972904189078, 11.95508246608782, 5.724221361280307], "isController": false}, {"data": ["01 Login cliente", 3353, 0, 0.0, 67.53235908141954, 58, 111, 67.0, 74.0, 77.0, 89.0, 28.051300499452026, 17.751213597309484, 8.414429363512394], "isController": false}, {"data": ["05 Estado del expediente", 3282, 0, 0.0, 5.61852528945766, 3, 38, 5.0, 8.0, 10.0, 15.0, 27.975962153177342, 18.19510372714487, 6.365624200869454], "isController": false}, {"data": ["04 Adjuntar documento", 3297, 0, 0.0, 11.458902032150464, 7, 53, 11.0, 15.0, 17.0, 24.019999999999982, 27.97837764445312, 18.715855408452917, 23.278055812493108], "isController": false}, {"data": ["15 Verificaciones del expediente", 1645, 0, 0.0, 7.527051671732516, 4, 51, 7.0, 10.0, 12.0, 19.0, 14.018134096874254, 14.538571306072537, 3.3950168515867336], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1, 100.0, 0.003356493135971537], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 29793, 1, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["16 Historial del expediente", 1636, 1, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
