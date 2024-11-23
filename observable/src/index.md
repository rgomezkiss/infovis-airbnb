---
title: Grupo 6 - Infovis
toc: false
---

<div class="hero">
  <h1>Infovis Airbnb CABA</h1>
  <h2>Trabajo Práctico Grupal (Grupo 6)</h2>
  <div class="team-members">
    <div class="member">
      <h4>Integrante 1</h4>
      <p>Lucas Agustín Ferreiro</p>
    </div>
    <div class="member">
      <h4>Integrante 2</h4>
      <p>Tomas Gabriel Alvarez Escalante</p>
    </div>
    <div class="member">
      <h4>Integrante 3</h4>
      <p>Roman Gómez Kiss</p>
    </div>
  </div>
</div>

# HOLA

---

<style>

.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 4rem 0 8rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

/* Team Section */
.team {
  text-align: center;
  margin: 4rem 0;
  font-family: var(--sans-serif);
}

.team h3 {
  font-size: 28px;
  font-weight: 700;
  color: var(--theme-foreground);
  margin-bottom: 2rem;
}

.team-members {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.member {
  background: var(--theme-background-secondary);
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.member:hover {
  transform: translateY(-5px);
}

.member h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--theme-foreground-focus);
}

.member p {
  margin: 0.5rem 0 0;
  font-size: 16px;
  font-weight: 400;
  color: var(--theme-foreground-muted);
}

</style>
