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
// must use a large limit (200) as not all fire events will be major so a fire event can appear well below the default 50 record limit.
const targeturl = "https://api.open511.gov.bc.ca/events?format=json&status=ACTIVE&jurisdiction=drivebc.ca&limit=350"; //Open511 access point URL -- &event_type=INCIDENT
const repeatinterval = 15 * 60 * 1000;  // time between data gets
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


function displayEvents(events) {
  /* build an HTML table and populate it by iterating over events from the JSON structure
    IN: theseEvents = the table of events from the JSON feed.
    ASSUMES:
    existence of DOM entities with IDs as:
      #incidentcount  - count of events in data
      #thetime        - the local time the currently presented data was acquired
      #TableHere      - where the data table presentation shouyld be placed.

    FIRES Version: This version is modified to display only events that have event_subtypes[0] == "FIRE"
        This is specialized to at least count if not track those events that are associates with wildfires
  */
  
  const fireEvents = events.filter(e => e.event_subtypes[0] === "FIRE");
  const tableContainer = $("#TableHere").empty();
  const table = $("<table>").attr("id", "theTable");
  const now = new Date().toLocaleTimeString();

  $("#thetime").text(now);
  $("#incidentcount").text(`${fireEvents.length} fire events of ${events.length} total events`);

  if (fireEvents.length === 0) {
    tableContainer.html('<p class="noevents">No events at this time</p>');
    return;
  }

  fireEvents.forEach(event => {
    const mapUrl = generateMapUrl(event.geography);
    const row = $("<tr>").append(
      $("<td>").addClass("datecell").html(`
        ${event.event_type}<br>
        ${event.roads[0].name}<br>
        ${event.created}<br>
        <a target='_blank' href='${mapUrl}'>MAP</a>
      `),
      $("<td>").html(`${event.description}<br><em>Created: ${event.created}<br>Updated: ${event.updated}</em>`)
    );
    table.append(row);
  });

  tableContainer.append(table);
}

function generateMapUrl(geo) {
  // create and return a Google Maps specific URL to place a marker
  // REQUIRES: geo  = event.geography
  if (!geo) return "";
  if (geo.type === "Point") {
    const [lon, lat] = geo.coordinates;
    return `https://maps.google.com/?q=${lat},${lon}&ll=${lat},${lon}&z=12`;
  }
  if (geo.type === "LineString") {
    const mid = Math.floor(geo.coordinates.length / 2);
    let [lon, lat] = geo.coordinates[mid];
    // console.log("Original = " + [lat, lon]);
    if (lat < 0) [lat, lon] = [lon, lat]; // Swap if needed  -- check that lat lon are in correct order ... for North America LON will always be < 0
    // console.log("Swapped= = " + [lat, lon]);
    return `https://maps.google.com/?q=${lat},${lon}&ll=${lat},${lon}&z=12`;
  }
  return "";
}
  
function controller() {
  console.log( "calling get at " + new Date().toLocaleTimeString() );
  getDBC_Open511();
}
controller();
setInterval(controller, repeatinterval);
