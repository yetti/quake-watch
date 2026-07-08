import { Component } from '@angular/core';
import { Quake } from '../../../../shared/models/quake.model';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-quake-list',
  imports: [DecimalPipe],
  templateUrl: './quake-list.html',
  styleUrl: './quake-list.css',
})
export class QuakeList {
  quakes: Array<Quake> = [
    {
      id: 'ga2026myjxni',
      place: '2107 km SE of Stanley',
      magnitude: 5.34529959023402,
      time: Date.parse("2026-07-02T02:57:44.132Z"),
      lng: -26.5514640808105,
      lat: -58.5082550048828,
      depth: 201.780807495117,
      magnitudeType: "mb",
      inAustralia: false,
      feltReportUrl: "https://earthquakes.ga.gov.au/feltreport/ga2026myjxni",
    },
    {
      id: 'ga2026nafbie',
      place: '114 km N of Ternate',
      magnitude: 6.13838340981482,
      time: Date.parse("2026-07-03T02:31:29.156Z"),
      lng: 127.466857910156,
      lat: 1.81179928779602,
      depth: 201.780807495117,
      magnitudeType: "Mw",
      inAustralia: false,
      feltReportUrl: "https://earthquakes.ga.gov.au/feltreport/ga2026nafbie",
    }
  ]
}
