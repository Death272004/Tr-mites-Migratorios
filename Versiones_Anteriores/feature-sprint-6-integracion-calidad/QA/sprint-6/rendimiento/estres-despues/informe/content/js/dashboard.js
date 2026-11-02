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

    var data = {"OkPercent": 99.99665875906311, "KoPercent": 0.0033412409368839585};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9999665875906312, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "02 Listar mis expedientes"], "isController": false}, {"data": [1.0, 500, 1500, "12 Bandeja del despacho"], "isController": false}, {"data": [1.0, 500, 1500, "11 Login analista"], "isController": false}, {"data": [1.0, 500, 1500, "03 Crear expediente"], "isController": false}, {"data": [1.0, 500, 1500, "13 Documentos del expediente"], "isController": false}, {"data": [0.9996953077391835, 500, 1500, "06 Verificaciones (cliente)"], "isController": false}, {"data": [1.0, 500, 1500, "16 Historial del expediente"], "isController": false}, {"data": [1.0, 500, 1500, "14 Registrar verificación TE (simulada)"], "isController": false}, {"data": [1.0, 500, 1500, "01 Login cliente"], "isController": false}, {"data": [1.0, 500, 1500, "05 Estado del expediente"], "isController": false}, {"data": [1.0, 500, 1500, "04 Adjuntar documento"], "isController": false}, {"data": [1.0, 500, 1500, "15 Verificaciones del expediente"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 29929, 1, 0.0033412409368839585, 19.00003341240924, 2, 218, 10.0, 66.0, 70.0, 77.0, 250.47284291572518, 397.2219416242991, 80.97063888714537], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["02 Listar mis expedientes", 3345, 0, 0.0, 11.704932735425992, 7, 51, 11.0, 15.0, 17.0, 22.0, 28.171505091083652, 174.17037463838147, 5.914915619709947], "isController": false}, {"data": ["12 Bandeja del despacho", 1677, 0, 0.0, 11.65891472868218, 8, 51, 11.0, 14.0, 16.0, 22.0, 14.12174850319571, 87.30763808335368, 2.9650155548701926], "isController": false}, {"data": ["11 Login analista", 1686, 0, 0.0, 68.02135231316727, 58, 218, 67.0, 74.0, 77.0, 90.0, 14.117883489780025, 9.375157004932047, 4.27671622091222], "isController": false}, {"data": ["03 Crear expediente", 3332, 0, 0.0, 10.157863145258128, 6, 51, 10.0, 13.0, 14.0, 22.0, 28.19714305057207, 18.504127201315075, 7.8753739379527445], "isController": false}, {"data": ["13 Documentos del expediente", 1671, 0, 0.0, 6.069419509275874, 3, 23, 6.0, 8.0, 10.0, 15.0, 14.14998475764658, 9.100698832795617, 3.371676055532974], "isController": false}, {"data": ["06 Verificaciones (cliente)", 3282, 1, 0.030469226081657527, 6.072821450335161, 2, 36, 6.0, 8.0, 10.0, 14.0, 28.165629693198884, 13.25876454891654, 6.8192850246728165], "isController": false}, {"data": ["16 Historial del expediente", 1644, 0, 0.0, 5.990267639902673, 3, 26, 5.0, 8.0, 10.0, 13.0, 14.117768293416002, 7.334621808688782, 3.3502125930664928], "isController": false}, {"data": ["14 Registrar verificación TE (simulada)", 1661, 0, 0.0, 11.447922937989178, 7, 73, 11.0, 14.0, 16.0, 21.0, 14.123068812760929, 12.040393114047395, 5.765080823959051], "isController": false}, {"data": ["01 Login cliente", 3362, 0, 0.0, 68.3530636525879, 59, 218, 67.0, 75.0, 78.0, 88.36999999999989, 28.151795284030012, 17.81480795317524, 8.444635814409164], "isController": false}, {"data": ["05 Estado del expediente", 3298, 0, 0.0, 5.882049727107334, 3, 32, 5.0, 8.0, 10.0, 14.0, 28.19598690228868, 18.33820516684193, 6.415688426009045], "isController": false}, {"data": ["04 Adjuntar documento", 3316, 0, 0.0, 12.16224366706875, 7, 65, 12.0, 15.0, 18.0, 24.0, 28.19584034828155, 18.8613755888305, 23.457362400727856], "isController": false}, {"data": ["15 Verificaciones del expediente", 1655, 0, 0.0, 7.8241691842900325, 5, 33, 7.0, 10.0, 12.0, 17.0, 14.145420046325182, 14.775992676753647, 3.4258439174693804], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1, 100.0, 0.0033412409368839585], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 29929, 1, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["06 Verificaciones (cliente)", 3282, 1, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
