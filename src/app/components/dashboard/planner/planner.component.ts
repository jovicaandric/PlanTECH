import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../../services/auth.service";
import { Router } from '@angular/router';
declare var $: any;
import swal from 'sweetalert2';
import { TranslateService } from 'ng2-translate';

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.css']
})
export class PlannerComponent implements OnInit {

  private currentUser;
  private events: any[] = [];
  private eventsD: any[] = [];
  color = "red";
  constructor(private authService: AuthService, private router: Router, private translateService: TranslateService) {
    if (localStorage.getItem('user') == null)
      this.router.navigate(['/login']);

    this.currentUser = JSON.parse(localStorage.getItem('user'));
    //this.getAllEventsForUser();
  }

  getAllEventsForUser() {
    this.authService.getEventsForUser(this.currentUser.Id).subscribe(data => {
      let events = JSON.parse(data.events);
      events.forEach(event => {
        var e = {
          id: event.Id,
          title: event.Name,
          start: new Date(+event.Date * 1000),
          backgroundColor: event.BgColor, //red
          borderColor: event.BorderColor,
          editable: true,
          allDay: false
          // class: "external-event" + event. //red
        };
        console.log(event.Name);
        if (event.InCalendar == 1)
          this.events.push(e);
        else this.eventsD.push(e);
      });

      var niz = this.events;
      var auth = this.authService;
      var user = this.currentUser.Id;
      var translate = this.translateService;
      $(function () {

        /* initialize the external events
         -----------------------------------------------------------------*/
        function ini_events(ele) {
          ele.each(function () {

            // create an Event Object (http://arshaw.com/fullcalendar/docs/event_data/Event_Object/)
            // it doesn't need to have a start or end
            var eventObject = {
              title: $.trim($(this).text()) // use the element's text as the event title
            };

            console.log(eventObject.title);

            // store the Event Object in the DOM element so we can get to it later
            $(this).data('eventObject', eventObject);

            // make the event draggable using jQuery UI
            $(this).draggable({
              zIndex: 1070,
              revert: true, // will cause the event to go back to its
              revertDuration: 0  //  original position after the drag
            });

          });
        }

        ini_events($('#external-events div.external-event'));

        /* initialize the calendar
         -----------------------------------------------------------------*/
        //Date for the calendar events (dummy data)
        var today; var month; var lang;
        if (translate.currentLang == "srb") {
          today = "Danas";
          month = "Mesec";
          lang = "sr";
        }
        else {
          today = "Today";
          month = "Month";
          lang = "en";
        }
        var date = new Date();
        var d = date.getDate(),
          m = date.getMonth(),
          y = date.getFullYear();


        $('#calendar').fullCalendar({
          lang: lang,
          header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month'
          },
          buttonText: {
            today: today,
            month: month
          },
          firstDay: 1,
          //Random default events
          events: niz,
          editable: true,
          droppable: true,
          eventLimit: true,
          disableResizing: true,
          eventDurationEditable: false,
          displayEventTime: false,



          eventClick: function (calEvent, jsEvent, view) {

            if(calEvent.id == undefined)
            {
              alert("Please refresh the page in order to modify newly added events!");
              return;
            }

            $("#tekst").val("");
            var a = "dd";;
            $('#myModal').modal('show');
            $('#tekst').val(calEvent.title);
            $('#ponisti').off("click");
            $('#ponisti').click( function (e) {
                var v = $('#tekst').val();
                
                auth.deleteEvent(calEvent.id).subscribe(data => {
                  if (data.success) {
                    $('#calendar').fullCalendar('removeEvents', calEvent.id);
                  } else {
                    console.log(data.err);
                  }


                  console.log("Brisanje "+calEvent.title+"|"+calEvent.id);
                });
            });
            $('#izmeni').off("click");
            $('#izmeni').click( function (e) {
              var v = $('#tekst').val();
              var dataChange = {
                id: calEvent.id,
                title: v
              }

              auth.changeEventTitle(dataChange).subscribe(data => {
                if (data.success) {

                } else {
                  console.log(data.err);
                }
              });
              calEvent.title = dataChange.title;

              $('#calendar').fullCalendar('updateEvent', calEvent);

            });

          },
          eventDrop: function (event) {
            var newDate = new Date(event.start).getTime() / 1000;
            //promena
            var dataChange = {
              id: event.id,
              date: newDate
            }
            auth.changeEventDate(dataChange).subscribe(data => {
              if (data.success) {
                //this.router.navigate(['/user-profile']);
              } else {
                console.log(data.err);

              }
            });


          },// this allows things to be dropped onto the calendar !!!
          drop: function (date, allDay) { // this function is called when something is dropped

            // retrieve the dropped element's stored Event Object
            var originalEventObject = $(this).data('eventObject');
            //  alert($.trim($(this).text()));
            // we need to copy it, so that multiple events don't have a reference to the same object
            var copiedEventObject = $.extend({}, originalEventObject);

            // assign it the date that was reported
            var title = $.trim($(this).text());

            copiedEventObject.start = date;
            copiedEventObject.allDay = allDay;
            copiedEventObject.backgroundColor = $(this).css("background-color");
            copiedEventObject.borderColor = $(this).css("border-color");

            var max = 0;
            for(var i=0; i<niz.length; i++)
            {
              if(niz[i].id > max) max = niz[i].id;
            }

            var dataCal = {
              id: max+1,
              date: date / 1000,
              title: title,
              userId: user,
              backgroundColor: copiedEventObject.backgroundColor, //red
              borderColor: copiedEventObject.borderColor //red
            }
            niz.push(dataCal);

            auth.addNewEventCalendar(dataCal).subscribe(data => {
              if (data.success) {
                //this.router.navigate(['/planner']);
              } else {
                console.log(data.err);

              }
            });
            $('#calendar').css('font-size', '15px !important');
            // render the event on the calendar
            // the last `true` argument determines if the event "sticks" (http://arshaw.com/fullcalendar/docs/event_rendering/renderEvent/)
            $('#calendar').fullCalendar('renderEvent', copiedEventObject, true);

            // is the "remove after drop" checkbox checked?
            if ($('#drop-remove').is(':checked')) {
              // if so, remove the element from the "Draggable Events" list
              var a = $(this).attr('id');
              auth.deleteEvent(a).subscribe(data => {
                if (data.success) {

                } else {
                  console.log(data.err);
                }
              });
              $(this).remove();
            }

          }
        });


        /* ADDING EVENTS */
        var currColor = "#3c8dbc"; //Red by default
        //Color chooser button
        var colorChooser = $("#color-chooser-btn");
        $("#color-chooser > li > a").click(function (e) {
          e.preventDefault();
          //Save color
          currColor = $(this).css("color");
          //Add color effect to button
          $('#add-new-event').css({ "background-color": currColor, "border-color": currColor });
        });
        $("#add-new-event").click(function (e) {
          e.preventDefault();
          //Get value and make sure it is not null
          var val = $("#new-event").val();
          if (val.length == 0) {
            return;
          }
          var data = {
            title: val,
            userId: user,
            backgroundColor: currColor, //red
            borderColor: currColor

          }
          var eventId;

          auth.addNewEventDraggable(data).subscribe(data1 => {

            eventId = data1.eventId;
            //Create events
            var event = $("<div />");
            event.css({ "background-color": currColor, "border-color": currColor, "color": "#fff" }).addClass("external-event");
            event.html(val);
            event.attr("id", eventId);


            $('#external-events').prepend(event);

            //Add draggable funtionality
            ini_events(event);

            //Remove event from text input
            $("#new-event").val("");
          });

        });
      });

      setTimeout(() => {
      for(var i = 0; i < this.eventsD.length; i++) {;
        
        document.getElementById(this.eventsD[i].id).setAttribute("style", "background-color:"+this.eventsD[i].backgroundColor+ ";color:white");
      }
       }, 150);
      
    });
  }

  ngOnInit() {
    this.getAllEventsForUser();
  }


  deleteDraggable(event) {

    this.authService.deleteEvent(event).subscribe(data => {
      if (data.success) {
        this.getAllEventsForUser();
      } else {
        console.log(data.err);
      }
    });
  }

  setColor(id) {
    console.log(id + "--iddd");
    this.eventsD.forEach(element => {
      console.log(id + " = " + element.id);
      if (element.id == id) {
        return element.backgroundColor;
      }
    });
    return "red";
  }

  
}
