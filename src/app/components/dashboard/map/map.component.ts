import { Component, OnInit } from '@angular/core';
import { MapService } from '../../../services/map.service';
import './map.engine.js';
import { Router } from '@angular/router';
import { SelectModule } from 'ng2-select';
import { MyDatePickerModule, IMyOptions, IMyDateModel } from 'mydatepicker';

declare function init(plantages, measurers): any;
declare function addNewPlantage(addedPlants): any;
declare function addNewMeasurer(addedMeasurer): any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnInit {
  public categories: any = [];
  public plants: any = [];
  public species: any = [];
  public seeds: any = [];
  public addedPlants: any = [];
  public plantDate: number;
  private user: any;

  private plantages: any;

  private categoryValue: any = {};
  private plantValue: any = {};
  private specieValue: any = {};
  private seedValue: any = {};

  private hiddenPlant: boolean = true;
  private hiddenSpecie: boolean = true;
  private hiddenSeed: boolean = true;
  private hiddenDate: boolean = true;
  private hiddenNew: boolean = true;

  private measurerUrl: any;
  private measureValue: any;
  private checkedPlantages: any;

  flag = false;
  checkInputEmpty(title:string)
  {
    if(title.length >= 2)
    {
      this.flag = true;
    }
    else
    {
      this.flag = false;
    }
  }

  //za kategoriju  
  public selectedCategory(value: any): void {
    this.hiddenPlant = true;
    this.hiddenSpecie = true;
    this.hiddenSeed = true;
    this.hiddenDate = true;
    this.hiddenPlant = true;
    this.hiddenNew = true;
    this.getPlants(value.id);
    this.categoryValue = value;
    this.hiddenPlant = false;

  }

  public removedCategory(value: any): void {
    this.hiddenPlant = true;
    this.hiddenSpecie = true;
    this.hiddenSeed = true;
    this.hiddenDate = true;
    this.hiddenNew = true;
  }

  public typedCategory(value: any): void {
  }

  //za biljku  
  public selectedPlant(value: any): void {
    this.hiddenSpecie = true;
    this.hiddenSeed = true;
    this.hiddenDate = true;
    this.hiddenNew = true;
    this.getSpecies(value.id);
    this.plantValue = value;
    this.hiddenSpecie = false;
  }

  public removedPlant(value: any): void {
    this.hiddenSpecie = true;
    this.hiddenSeed = true;
    this.hiddenDate = true;
    this.hiddenNew = true;
  }

  public typedPlant(value: any): void {
  }

  //za sortu  
  public selectedSpecie(value: any): void {
    this.hiddenSeed = true;
    this.hiddenDate = true;
    this.hiddenNew = true;
    this.getSeedManufacturers(value.id);
    this.specieValue = value;
    this.hiddenSeed = false;
  }

  public removedSpecie(value: any): void {
    this.hiddenSeed = true;
    this.hiddenDate = true;
    this.hiddenNew = true;
  }

  public typedSpecie(value: any): void {
  }

  //za proizvodjaca semena
  public selectedSeed(value: any): void {
    this.hiddenDate = true;
    this.hiddenNew = true;
    this.seedValue = value;
    this.hiddenDate = false;
  }

  public removedSeed(value: any): void {
    this.hiddenDate = true;
    this.hiddenNew = true;
  }

  public typedSeed(value: any): void {
  }

  onDateChanged(event: IMyDateModel) {
    this.plantDate = event.epoc;
    if (event.epoc == 0) {
      this.hiddenNew = true;
      this.plantDate = null;
    } else {
      this.hiddenNew = false;
      this.plantDate = event.epoc;
    }
  }

  addAnotherPlant() {
    this.addedPlants.push({
      category: {
        id: this.categoryValue.id,
        text: this.categoryValue.text
      },
      plant: {
        id: this.plantValue.id,
        text: this.plantValue.text
      },
      specie: {
        id: this.specieValue.id,
        text: this.specieValue.text
      },
      seedManufacturer: {
        id: this.seedValue.id,
        text: this.seedValue.text
      },
      plantDate: this.plantDate
    });
    this.hiddenDate = true;
    this.hiddenSeed = true;
    this.hiddenSpecie = true;
    this.hiddenPlant = true;
    this.hiddenNew = true;
  }

  removeAddedPlant(rbr: number) {
    this.addedPlants.splice(rbr, 1);
  }

  save() {

    if (!this.hiddenNew) {
      this.addedPlants.push({
        category: {
          id: this.categoryValue.id,
          text: this.categoryValue.text
        },
        plant: {
          id: this.plantValue.id,
          text: this.plantValue.text
        },
        specie: {
          id: this.specieValue.id,
          text: this.specieValue.text
        },
        seedManufacturer: {
          id: this.seedValue.id,
          text: this.seedValue.text
        },
        plantDate: this.plantDate
      });
    }
    addNewPlantage(this.addedPlants);
  }

  saveMeasurer() {
    let addedMeasurer: any = {};
    addedMeasurer.url = this.measurerUrl;
    addedMeasurer.measureValue = this.measureValue;
    addedMeasurer.checkedPlantages = [];
    for (var i = 0; i < this.checkedPlantages.length; i++)
      if (this.checkedPlantages[i] == true)
        addedMeasurer.checkedPlantages.push(this.plantages[i].plantageId);
    addedMeasurer.owner = JSON.parse(localStorage.getItem("user")).Id;
    addNewMeasurer(addedMeasurer);
  }

  constructor(private router: Router, private mapService: MapService) {
    if (localStorage.getItem('user') == null)
      this.router.navigate(['/login']);

    this.user = JSON.parse(localStorage.getItem('user'));

    this.mapService.getPlantages().subscribe(plantages => {
      this.plantages = plantages.plantages;
      this.checkedPlantages = new Array(plantages.length);
      this.mapService.getMeasurers(this.user).subscribe(measurers => {
        console.log(measurers);
        init(plantages, measurers);
      });
    });

    this.getCategories();

  }


  getCategories() {
    this.mapService.getPlantCategories().subscribe(categories => {
      this.categories = JSON.parse(categories.categories);
    });
  }
  getPlants(categoryID: any) {
    this.mapService.getPlants(categoryID, this.user.Id).subscribe(plants => {
      this.plants = JSON.parse(plants.plants);
    });
  }
  getSpecies(plantID: any) {
    this.mapService.getSpecies(plantID, this.user.Id).subscribe(species => {
      this.species = JSON.parse(species.species);
    });
  }
  getSeedManufacturers(specieID: any) {
    this.mapService.getSeedmanufacturer(specieID).subscribe(seeds => {
      this.seeds = JSON.parse(seeds.seeds);
    });
  }

  ngOnInit() {

  }
}


