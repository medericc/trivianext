import { Team } from './Team';
import { Question } from './Question';
import { allQuestions } from '../data/questionBank';

export class GameState {
  teams: Team[];
  currentTeamIndex: number;
  allThemes: string[] = [
    'Torah',
    'Prophètes', 
    'Nouveau Testament',
    'Propagation',
    'Personnages',
    'Culture'
  ];
  askedQuestions: Question[] = [];

  constructor(teams: Team[]) {
    this.teams = teams;
    this.currentTeamIndex = 0;
  }

  get currentTeam(): Team {
    return this.teams[this.currentTeamIndex];
  }

  nextTeam(): void {
    this.currentTeamIndex = (this.currentTeamIndex + 1) % this.teams.length;
  }

  isThemeAvailableForCamembert(theme: string): boolean {
    return !this.currentTeam.wonThemes.includes(theme);
  }

  currentTeamHasWon(): boolean {
    return this.currentTeam.wonThemes.length === this.allThemes.length;
  }

  addThemeToCurrentTeam(theme: string): void {
    if (this.isThemeAvailableForCamembert(theme) && !this.currentTeam.wonThemes.includes(theme)) {
      this.currentTeam.wonThemes.push(theme);
    }
  }

  getRandomQuestions(count: number): Question[] {
    // Éviter les doublons
    const remaining = allQuestions.filter(q => 
      !this.askedQuestions.some(aq => aq.question === q.question)
    );
    
    if (remaining.length === 0) {
      // Si plus de questions, réinitialiser l'historique
      this.askedQuestions = [];
      return allQuestions.slice(0, count);
    }
    
    const shuffled = [...remaining].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    this.askedQuestions.push(...selected);
    return selected;
  }

  getQuestionForTheme(theme: string): Question | null {
    const filtered = allQuestions.filter(q => 
      q.theme === theme && 
      !this.askedQuestions.some(aq => aq.question === q.question)
    );
    
    if (filtered.length === 0) return null;
    
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    const question = shuffled[0];
    this.askedQuestions.push(question);
    return question;
  }

  getRandomQuestionForAvailableThemes(): Question | null {
    const availableThemes = this.allThemes.filter(theme => 
      this.isThemeAvailableForCamembert(theme)
    );

    if (availableThemes.length === 0) return null;

    const filteredQuestions = allQuestions.filter(q => 
      availableThemes.includes(q.theme) && 
      !this.askedQuestions.some(aq => aq.question === q.question)
    );

    if (filteredQuestions.length === 0) return null;

    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    const question = shuffled[0];
    this.askedQuestions.push(question);
    return question;
  }
}