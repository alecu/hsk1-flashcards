export function stripDiacritics(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function normalizeAnswer(value: string) {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/（.*?）/g, "")
    .replace(/[¿?¡!.,;:()[\]{}"']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeWord(value: string) {
  return value.replace(/（.*?）/g, "").trim();
}

const optionalArticles = new Set([
  "el",
  "la",
  "los",
  "las",
  "un",
  "una",
  "unos",
  "unas",
]);

function stripReflexive(token: string) {
  return token.endsWith("se") && token.length > 4 ? token.slice(0, -2) : token;
}

function singularizeToken(token: string) {
  if (token.endsWith("es") && token.length > 5) {
    return token.slice(0, -2);
  }

  if (token.endsWith("s") && token.length > 4) {
    return token.slice(0, -1);
  }

  return token;
}

function swapGender(token: string) {
  if (token.endsWith("os") && token.length > 4) {
    return `${token.slice(0, -2)}as`;
  }

  if (token.endsWith("as") && token.length > 4) {
    return `${token.slice(0, -2)}os`;
  }

  if (token.endsWith("o") && token.length > 3) {
    return `${token.slice(0, -1)}a`;
  }

  if (token.endsWith("a") && token.length > 3) {
    return `${token.slice(0, -1)}o`;
  }

  return null;
}

function getVerbStem(token: string) {
  const base = stripReflexive(token);

  if (/(ar|er|ir)$/.test(base) && base.length > 4) {
    return base.slice(0, -2);
  }

  const endings = [
    "ariamos",
    "eriamos",
    "iriamos",
    "aremos",
    "eremos",
    "iremos",
    "abamos",
    "iamos",
    "aron",
    "eran",
    "iran",
    "aban",
    "ando",
    "iendo",
    "ados",
    "idas",
    "idos",
    "ado",
    "ido",
    "aba",
    "ias",
    "ian",
    "ara",
    "era",
    "ira",
    "are",
    "ere",
    "ire",
    "amo",
    "emos",
    "imos",
    "ais",
    "eis",
    "ios",
    "as",
    "es",
    "an",
    "en",
    "o",
    "a",
    "e",
  ];

  const ending = endings.find(
    (candidate) => base.endsWith(candidate) && base.length - candidate.length >= 3,
  );

  return ending ? base.slice(0, -ending.length) : null;
}

function expandTokenForms(token: string) {
  const forms = new Set<string>();
  const reflexiveBase = stripReflexive(token);
  const singularBase = singularizeToken(reflexiveBase);
  const genderSwap = swapGender(reflexiveBase);
  const singularGenderSwap = swapGender(singularBase);

  forms.add(token);
  forms.add(reflexiveBase);
  forms.add(singularBase);

  if (reflexiveBase !== token) {
    forms.add(`${reflexiveBase}se`);
  }

  if (genderSwap) {
    forms.add(genderSwap);
    forms.add(singularizeToken(genderSwap));
  }

  if (singularGenderSwap) {
    forms.add(singularGenderSwap);
  }

  const verbStem = getVerbStem(token);

  if (verbStem) {
    forms.add(`verb:${verbStem}`);
  }

  return forms;
}

function stripOptionalLeadingArticles(tokens: string[]) {
  if (tokens.length > 1 && optionalArticles.has(tokens[0])) {
    return tokens.slice(1);
  }

  return tokens;
}

export function areEquivalentAnswers(left: string, right: string) {
  const normalizedLeft = normalizeAnswer(left);
  const normalizedRight = normalizeAnswer(right);

  if (normalizedLeft === normalizedRight) {
    return true;
  }

  const leftTokens = stripOptionalLeadingArticles(normalizedLeft.split(" "));
  const rightTokens = stripOptionalLeadingArticles(normalizedRight.split(" "));

  if (leftTokens.length !== rightTokens.length) {
    return false;
  }

  return leftTokens.every((leftToken, index) => {
    const rightToken = rightTokens[index];
    const leftForms = expandTokenForms(leftToken);
    const rightForms = expandTokenForms(rightToken);

    return [...leftForms].some((form) => rightForms.has(form));
  });
}
