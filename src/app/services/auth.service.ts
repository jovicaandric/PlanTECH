import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class AuthService {

  authToken: any;
  currentUser: any;

  constructor(
    private http: Http
  ) { }

  //Registruje user-a i vraca true ili false u zavisnosti kako je prosla registracija
  //Bilo bi lepo da server vraca poruku zasto je odbijena registracija i da se ona stampa
  registerUser(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/users/register', user, { headers: headers }).map(res => res.json());
  }

  getAllUsers() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/users/allusers", { headers: headers }).map(res => res.json());
  }

  getOwnerRequests() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/users/owner-requests", { headers: headers }).map(res => res.json());
  }

  //Autentifikacija
  //Vraca token i user info ako je uspesno
  //Ako nije uspesno vraca problem "Nepostojeci korisnik"...
  authenticateUser(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/users/authenticate', user, { headers: headers }).map(res => res.json());
  }

  //Cuva podatke o logovanom korisniku (lakse se koriste posle)
  storeUserData(user) {
    // localStorage.setItem('id_token', token);
    localStorage.setItem('user', user);
    // this.authToken = token;
    this.currentUser = user;
  }

  logout() {
    this.currentUser = null;
    localStorage.clear();
  }

  deleteUser(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/users/delete', user, { headers: headers }).map(res => res.json());
  }

  updateUser(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/users/update', user, { headers: headers }).map(res => res.json());
  }

  confirmRegistration(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/users/regConfirm', user, { headers: headers }).map(res => res.json());
  }

  discardRegistration(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/users/regDiscard', user, { headers: headers }).map(res => res.json());
  }

  getOwnerId(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/users/owner-requests/userID', user, { headers: headers }).map(res => res.json());
  }

  addOwnerRequest(data) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/users/owner-requests/addOwnerReq', data, { headers: headers }).map(res => res.json());
  }
  checkIfOwner(id) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/users/checkIfOwner', { Id: id }, { headers: headers }).map(res => res.json());
  }

  checkIfCanSeePlantages(id) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/plantages/checkIfCanSeePlantages', { Id: id }, { headers: headers }).map(res => res.json());
  }

  checkIfRuler(id) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/rules/checkIfRuler', { Id: id }, { headers: headers }).map(res => res.json());
  }

  checkUpgrade(id) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/billing/checkUpgrade', { Id: id }, { headers: headers }).map(res => res.json());
  }

  editUserName(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/user-profile/editName', user, { headers: headers }).map(res => res.json());
  }

  editUserUsername(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/user-profile/editUsername', user, { headers: headers }).map(res => res.json());
  }

  editUserEmail(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/user-profile/editEmail', user, { headers: headers }).map(res => res.json());
  }

  editUserPassword(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/user-profile/editPassword', user, { headers: headers }).map(res => res.json());
  }

  getPlantages(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/work-requests', user, { headers: headers }).map(res => res.json());
  }

  getUsersForRequests() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/work-requests/getAllUsersForRequests', { headers: headers }).map(res => res.json());
  }

  getUsersForRequests2() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/find-work/getAllUsersForRequests', { headers: headers }).map(res => res.json());
  }

  getPermissions() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/work-requests/getPermissions", { headers: headers }).map(res => res.json());
  }


  messagePermissions(dataToSend) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/work-requests/sendMessage', dataToSend, { headers: headers }).map(res => res.json());
  }

  getRequested() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/work-requests/getRequested", { headers: headers }).map(res => res.json());
  }

  getJobOffers(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/jobOffers/all", { id: user }, { headers: headers }).map(res => res.json());
  }
  acceptOffer(offerId) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/jobOffers/accept", { id: offerId }, { headers: headers }).map(res => res.json());
  }


  refuseOffer(offerId) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/jobOffers/refuse", { id: offerId }, { headers: headers }).map(res => res.json());
  }

  getJobRequests(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/jobRequests/all", { id: user }, { headers: headers }).map(res => res.json());
  }
  // acceptRequest(offerId) {
  //   let headers = new Headers();
  //   headers.append('Content-Type', 'application/json');
  //   return this.http.post("/jobOffers/accept", { id: offerId }, { headers: headers }).map(res => res.json());
  // }

  getUserPermission() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/my-employees/getPermissions", { headers: headers }).map(res => res.json());
  }

  getMyEmployees(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/my-employees/getMyEmployees", user, { headers: headers }).map(res => res.json());
  }

  addNewEmployee(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/my-employees/add", user, { headers: headers }).map(res => res.json());
  }

  acceptJobReq(user) {
    //console.log('servis ' + user);
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/job-requests/accept", user, { headers: headers }).map(res => res.json());
  }

  dismissEmployee(employee) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/my-employees/remove", employee, { headers: headers }).map(res => res.json());
  }
  editPermissions(user, owner) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/my-employees/edit", { user: user, owner: owner }, { headers: headers }).map(res => res.json());
  }

  deleteRequest(data) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/work-requests/deleteRequest", data, { headers: headers }).map(res => res.json());
  }

  deleteRequest2(data) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/find-work/deleteRequest", data, { headers: headers }).map(res => res.json());
  }

  getAllPlants(userId) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/plants/all", { userId }, { headers: headers }).map(res => res.json());
  }

  addNewPlant(newPlant) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/plants/add", { newPlant }, { headers: headers }).map(res => res.json());
  }

  removePlant(specieId) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/plants/remove", { specieId }, { headers: headers }).map(res => res.json());
  }

  googleAuth() {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/google2", {}, { headers: headers }).map(res => res.json());
  }

  getEventsForUser(userId) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/planner", { UserId: userId }, { headers: headers }).map(res => res.json());
  }

  addNewEventDraggable(event) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/planner/addEventDrag", { event: event }, { headers: headers }).map(res => res.json());
  }

  addNewEventCalendar(event) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/planner/addEventCal", { event: event }, { headers: headers }).map(res => res.json());
  }

  deleteEvent(event) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/planner/deleteEvent", { event: event }, { headers: headers }).map(res => res.json());
  }

  getEmployersForUser(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/my-employers/getEmployersForUser", user, { headers: headers }).map(res => res.json());
  }
  getPlantagesIWorkOn(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/my-employers/getPlantagesIWorkOn", user, { headers: headers }).map(res => res.json());
  }
  addRule(rule, userId, plantId) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/rules/add", { rule, userId, plantId }, { headers: headers }).map(res => res.json());
  }
  quit(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/my-employers/quit", user, { headers: headers }).map(res => res.json());
  }

  getUserProgress(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/user/progress", user, { headers: headers }).map(res => res.json());
  }

  upgradePlan(data) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/user/upgradePlan", data, { headers: headers }).map(res => res.json());
  }
  getUsersPlantages(user) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/weather/plantages", user, { headers: headers }).map(res => res.json());
  }
  changeEventDate(event) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/planner/change", { event: event }, { headers: headers }).map(res => res.json());
  }
  changeEventTitle(event) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/planner/changeTitle", { event: event }, { headers: headers }).map(res => res.json());
  }

  getForecastPast(plantageId) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/plantage/getForecast", { plantageId: plantageId }, { headers: headers }).map(res => res.json());
  }

  sendImage() {
    let headers = new Headers();
    return this.http.post("/user-profile/upload", {}, { headers: headers }).map(res => res.json());
  }

  sendToEmailCheck(dataToSend) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/sendToEmailN", { dataToSend: dataToSend }, { headers: headers }).map(res => res.json());
  }

  getIfSendToEmail(userId) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/getIfSendToEmail", { userId: userId }, { headers: headers }).map(res => res.json());
  }

  getAdvancedRules(userId) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/getAdvancedRules", { userId: userId }, { headers: headers }).map(res => res.json());
  }

  getPlantageOwners(userId) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/getPlantageOwners", { userId: userId }, { headers: headers }).map(res => res.json());
  }
  getPlantagesForOwner(ownerId, userId) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/getPlantagesForOwner", { ownerId: ownerId, userId: userId }, { headers: headers }).map(res => res.json());
  }

  addAdvancedRule(userId, rule) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/addAdvancedRule", { userId: userId, rule: rule }, { headers: headers }).map(res => res.json());
  }

  deleteAdvancedRule(rule) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/deleteAdvancedRule", { rule: rule }, { headers: headers }).map(res => res.json());
  }

  updateImage(image) {
    return this.http.post('/user-profile/upload', image)
      .map(resp => resp.json());
  }

  getImage(userId) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/getUserImage", { userId: userId }, { headers: headers }).map(res => res.json());
  }

  getImageTop(userId) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/getUserImageTop", { userId: userId }, { headers: headers }).map(res => res.json());
  }
  forgot(email) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post("/users/forgot", { email: email }, { headers: headers }).map(res => res.json());
  }
}
