import type { Page } from '@playwright/test';

// ACTOR: quien ejecuta la prueba. Equivale a actorCalled('Santiago') de Serenity/JS.
// La ABILITY es BrowseTheWeb: el actor solo puede actuar a traves de una Page de Playwright.
export class Actor {
  private constructor(public readonly name: string, private readonly page: Page) {}

  // Fábrica: Santiago con habilidad de navegar. En Serenity: actorCalled(name).whoCan(BrowseTheWebWithPlaywright.using(page))
  static named(name: string, page: Page): Actor {
    return new Actor(name, page);
  }

  // El actor intenta una o varias tareas en orden.
  async attemptsTo(...tasks: Task[]): Promise<void> {
    for (const task of tasks) await task.performAs(this);
  }

  // El actor pregunta algo de la pagina y recibe la respuesta tipada.
  async asks<T>(question: Question<T>): Promise<T> {
    return question.answeredBy(this);
  }

  // Acceso interno a la Page (solo Tasks/Questions lo usan, nunca el spec).
  get browse(): Page {
    return this.page;
  }
}

// TASK: una accion de negocio reutilizable (equivale a Task.where en Serenity).
export interface Task {
  performAs(actor: Actor): Promise<void>;
}

// QUESTION: una lectura verificable (equivale a Question.about en Serenity).
export interface Question<T> {
  answeredBy(actor: Actor): Promise<T>;
}
