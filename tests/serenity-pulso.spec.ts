// Suite oficial Serenity/JS (runner @serenity-js/playwright-test).
// Usa Actor/Tasks/Questions de la libreria — no del nucleo propio src/core.
// API verificada en node_modules/@serenity-js/*/README y .d.ts (v3.48.1).
import { describe, it, test } from '@serenity-js/playwright-test';
import { By, Navigate, Page, PageElement } from '@serenity-js/web';
import { Ensure, equals, isTrue, startsWith } from '@serenity-js/assertions';

// Nota: el crew de reportes (ArtifactArchiver + Serenity BDD) se configura en
// playwright.serenity.config.ts, no aqui. Ver README de @serenity-js/playwright-test §Reporting.

const PULSO = process.env.PULSO_URL ?? 'https://marusan94.github.io/pulso-github/02-midnight-console.html';

test.use({ defaultActorName: 'Santiago' });

describe('Pulso GitHub (Serenity/JS oficial)', () => {
  it('muestra el titulo correcto', async ({ actor }) => {
    await actor.attemptsTo(
      Navigate.to(PULSO),
      Ensure.that(Page.current().title(), equals('Pulso GitHub · Consola')),
    );
  });

  it('muestra contenido del ranking', async ({ actor }) => {
    const Contenido = PageElement.located(By.css('table, article, li')).describedAs('contenido del ranking');
    await actor.attemptsTo(
      Navigate.to(PULSO),
      Ensure.that(Page.current().title(), startsWith('Pulso GitHub')),
      Ensure.that(Contenido.isPresent(), isTrue()),
    );
  });
});
