export class Team {
  name: string;
  wonThemes: string[];

  constructor(name: string) {
    this.name = name;
    this.wonThemes = [];
  }
}