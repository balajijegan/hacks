var apiendpoint = 'http://query.yahooapis.com/v1/public/yql?';

// diagnostics - remove if you don't need them
apiendpoint += '&diagnostics=true';

// format (json or xml)
apiendpoint += '&format=json'; 

// environment. this gives you access to the community tables
apiendpoint += '&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';


function loadWards(zone) {
    var index = zone.selectedIndex;
    var zoneNumber = zone.options[index].value;
    
    var query = "select ward_name from csv where url='http://spreadsheets.google.com/pub?key=0ArNtIJXgA96KdDVvVktBMG5yV1BUWGxoV3VXaUNSOXc&hl=en&single=true&gid=0&output=csv' and columns='ward_no,ward_name,zone_no,zone_address,assembly_constituency,mla,mla_party,parliament_constituency,taluk,mp,mp_party' and zone_no='" + zoneNumber + "'";

    var url = apiendpoint + "&q=" + encodeURIComponent(query);

    // callback function (when format is json this triggers JSON-P-X output)
    url += '&callback=processWards'; 
    
    var s = document.createElement('script');
    s.setAttribute('src',url);
    document.getElementsByTagName('head')[0].appendChild(s);
    
    var output = document.createElement('div');
    output.setAttribute('id','ward');
    document.getElementById('zone').parentNode.appendChild(output);
    output.innerHTML = 'Loading&hellip;';
    
    var debug = document.getElementById('debug');
    debug.innerHTML += "Calling: " + url + "<br /> <br />";
}    

function processWards(o){
    if(o.query && o.query.results && o.query.results.row){
	var row = o.query.results.row;
	var newSelect = document.createElement('select');
	newSelect.setAttribute('id',"ward");
	newSelect.setAttribute('name',"ward");
	newSelect.setAttribute('onChange',"loadWardDetails(this)");

	var newOption = document.createElement('option');
	newOption.value = 'Select a Ward';
	newOption.text = 'Select a Ward';
	newSelect.appendChild(newOption);

	for(var i=0;i<row.length;i++) {
	    newOption = document.createElement('option');
	    newOption.value = row[i].ward_name;
	    newOption.text = row[i].ward_name;
	    newSelect.appendChild(newOption);
	}
	var ward = document.getElementById('ward');
	ward.innerHTML = '';
	ward.appendChild(newSelect);
    } else {
	output.innerHTML = '<p class="error">Could not retrieve data...</p>';
    }
}


function loadWardDetails(ward) {
    var index = ward.selectedIndex;
    var wardName = ward.options[index].value;
    
    var query = "select * from csv where url='http://spreadsheets.google.com/pub?key=0ArNtIJXgA96KdDVvVktBMG5yV1BUWGxoV3VXaUNSOXc&hl=en&single=true&gid=0&output=csv' and columns='ward_no,ward_name,zone_no,zone_address,assembly_constituency,mla,mla_party,parliament_constituency,taluk,mp,mp_party' and ward_name='" + wardName + "'";

    var url = apiendpoint + "&q=" + encodeURIComponent(query);

    // callback function (when format is json this triggers JSON-P-X output)
    url += '&callback=processWardDetails'; 
    
    var s = document.createElement('script');
    s.setAttribute('src',url);
    document.getElementsByTagName('head')[0].appendChild(s);
    
    var output = document.createElement('div');
    output.setAttribute('id','wardDetails');
    document.getElementById('ward').parentNode.appendChild(output);
    output.innerHTML = 'Loading&hellip;';
    
    loadParkDetails(wardName);
    var debug = document.getElementById('debug');
    debug.innerHTML += "Calling: " + url + "<br /> <br />";

}

function loadParkDetails(wardName) {
    var query = "select * from csv where url='http://spreadsheets.google.com/pub?key=trxxdnpWdn6qrO1SyEBT9Jg&single=true&gid=0&output=csv' and columns='sno,div_no,zone_no,name,type' and div_no in (select ward_no from csv where url='http://spreadsheets.google.com/pub?key=0ArNtIJXgA96KdDVvVktBMG5yV1BUWGxoV3VXaUNSOXc&hl=en&single=true&gid=0&output=csv' and columns='ward_no,ward_name,zone_no,zone_address,assembly_constituency,mla,mla_party,parliament_constituency,taluk,mp,mp_party' and ward_name='" + wardName + "')";
    
    var url = apiendpoint + "&q=" + encodeURIComponent(query);

    // callback function (when format is json this triggers JSON-P-X output)
    url += '&callback=processParkDetails'; 
    
    s = document.createElement('script');
    s.setAttribute('src',url);
    document.getElementsByTagName('head')[0].appendChild(s);
    
    var output = document.createElement('div');
    output.setAttribute('id','parkDetails');
    document.getElementById('wardDetails').parentNode.appendChild(output);
    output.innerHTML = 'Loading&hellip;';

    var debug = document.getElementById('debug');
    debug.innerHTML += "Calling: " + url + "<br /> <br />";


}

function processWardDetails(o) {
    if(o.query && o.query.results && o.query.results.row){
	var row = o.query.results.row;
	var wardDetails = document.getElementById('wardDetails');
	var text = '<h3>Ward Details </h3>';
	text += '<ul>';
	text += '<li> <em>Ward No</em>: ' + row.ward_no + '</li>';
	text += '<li> <em>Ward Name</em>: ' + row.ward_name + '</li>';
	text += '<li> <em>MLA</em>: ' + row.mla + '</li>';
	text += '<li> <em>MLA\'s Party</em>: ' + row.mla_party + '</li>';

	text += '<li> <em>Assembly Constituency</em>: ' + row.assembly_constituency + '</li>';
	text += '<li> <em>Taluk</em>: ' + row.taluk + '</li>';
	text += '<li> <em>Member of Parliament</em>: ' + row.mp + '</li>';
	text += '<li> <em>MP\'s party</em>: ' + row.mp_party + '</li>';
	text += '</ul>'
	wardDetails.innerHTML = text;
    } else {
	output.innerHTML = '<p class="error">Could not retrieve data...</p>';
    }
}


function processParkDetails(o) {
    if(o.query && o.query.results && o.query.results.row){
	var row = o.query.results.row;
	var text = '<h3>Park Details</h3>';
	var trafficParks = '<h4>Traffic Islands</h4> <ul>';
	var roadsideParks = '<h4>Roadside Parks</h4> <ul>';

	var park;
	for(var i=0;i<row.length;i++) {
	    park = row[i];
	    if ( park.type == "R" ) {
		roadsideParks += '<li> ' + park.name + '</li>';
	    } else {
		trafficParks += '<li> ' + park.name + '</li>';
	    }
	}
	trafficParks += '</ul>';
	roadsideParks += '</ul>';
	var parkDetails = document.getElementById('parkDetails');
	parkDetails.innerHTML = text + trafficParks + roadsideParks;
	
    } else {
	output.innerHTML = '<p class="error">Could not retrieve data...</p>';
    }
}
