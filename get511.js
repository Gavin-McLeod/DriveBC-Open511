'use strict';

/* get511.js
 *   version 1.1
 *   gmcleod2@gmail.com, 2019-10-05
 *  
 *  Acquire and present event data within a table from an Open511 data source
 *  Created and tested only against the Open511 source from British Columbia
 *  Intended to present only current active data with MAJOR severity
 *  This version repeats its get and present on a indefinite repeating basis at a rate given in the variable repeatinterval
 *  Also presents the time at which the current get is executed (the time at which current data was valid)
 *  and presents separately the count of events found
 *  
 *  ASSUMES:
 *   existence of DOM entities with IDs as:
 *     #incidentcount  - count of events in data
 *     #thetime        - the local time the currently presented data was acquired
 *     #TableHere      - where the data table presentation shouyld be placed.
 */

// CONFIG
var targeturl = "https://api.open511.gov.bc.ca/events?format=json&status=ACTIVE&severity=MAJOR&jurisdiction=drivebc.ca"; //Open511 access point URL
var repeatinterval = 15 * 60 * 1000;  // time between data gets
//

function getDBC_Open511() {
  $.getJSON(targeturl, function (Events) {
    console.log("Data acquired");
    displayEvents(Events.events);
  })
  .fail(function() {
    console.log("error");
    $("#datahere").append("<p>ERROR: Something went wrong getting data.</p>");
  })
  .always(function() {
    console.log( "complete" );
  });

}


function displayEvents(theseEvents) {
  /* build a table and populate it by iterating over events from the JSON structure
     IN: theseEvents = the table of events from the JSON feed.
     ASSUMES:
      existence of DOM entities with IDs as:
        #incidentcount  - count of events in data
        #thetime        - the local time the currently presented data was acquired
        #TableHere      - where the data table presentation shouyld be placed.
  */
  
  $("#incidentcount").text(theseEvents.length);   //Display number of events and current time of this run (because we will be repeating in intervals)
  $("#thetime").text(new Date().toLocaleTimeString());

  
  $("#TableHere").empty();
  $("#TableHere").append($("<table>").attr('id','theTable'));
  console.log("Cleared table");
  
  if(theseEvents.length == 0) {			// write out something about no data here.
    console.log("NO DATA");
    $("#TableHere").html('<p class="noevents">No events at this time</p>');
    // $('<tr>').append($('<td class="noevents">').text('No events at this time')).appendTo('#theTable');
  } 
  else {
    $.each(theseEvents, function(i, event) {
      var latlon = [];
      var mapurl;
    
      switch (event.geography.type) {
        case "Point":                                                                 // Point type geometery
          mapurl = `https://maps.google.com/?q=${event.geography.coordinates[1]},${event.geography.coordinates[0]}&ll=${event.geography.coordinates[1]},${event.geography.coordinates[0]}&z=12`;
          // mapurl = `https://www.bing.com/maps/?cp=${event.geography.coordinates[1]}%7E${event.geography.coordinates[0]}&lvl=18.1style=g`;
        break;
        case "LineString":                                                            // LineString type geometery, display as Point at mid-string
          var middleofstring = Math.round(event.geography.coordinates.length / 2);    // index of middle of linestring
          latlon = event.geography.coordinates[middleofstring];                       // coords at that index
                                                
          if (latlon[0] < 0) {													    // check that lat lon are in correct order ... for North America LON will always be < 0
            var t = new Array();
            t[0] = latlon[1];
            t[1] = latlon[0];
            latlon = t;
          }
          
          mapurl = `https://maps.google.com/?q=${latlon}&ll=${latlon}&z=12`;
          // mapurl = `https://www.bing.com/maps/?cp=${latlon[0]}%7E${latlon[1]}&lvl=18.1`;
        break;
        default:
        mapurl = "";
      }
    
      $('<tr>').append(
        $('<td>').html(`${event.event_type}<br>${event.roads[0].name}<br><a target='map' href='${mapurl}'>MAP</a>`),
        $('<td>').html(`${event.description}<br><em>Created: ${event.created}</em>`)
      ).appendTo('#theTable')
	  });
  }
}
    
function controller() {
  console.log( "calling get at " + new Date().toLocaleTimeString() );
  getDBC_Open511();
}
controller();
setInterval(controller, repeatinterval);
