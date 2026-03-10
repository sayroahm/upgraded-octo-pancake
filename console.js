(function securityConsoleWarning() {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  if (isMobile) return;

  const C = {
    red:     'color:#FF2D2D; font-weight:900;',
    orange:  'color:#FF8C00; font-weight:800;',
    yellow:  'color:#FFE600; font-weight:700;',
    white:   'color:#FFFFFF; font-weight:600;',
    gray:    'color:#AAAAAA; font-weight:400;',
    cyan:    'color:#00E5FF; font-weight:700;',
    green:   'color:#39FF14; font-weight:700;',
    bgRed:   'background:#FF2D2D; color:#000; font-weight:900; padding:2px 6px; border-radius:3px;',
    bgBlack: 'background:#0a0a0a; color:#FF2D2D; font-weight:900; padding:4px 10px; border-radius:4px;',
    bigRed: `
      font-size: 42px;
      font-weight: 900;
      color: #FF2D2D;
      text-shadow: 0 0 10px #FF2D2D, 0 0 20px #ff000088;
      letter-spacing: 4px;
    `,
    bigOrange: `
      font-size: 18px;
      font-weight: 800;
      color: #FF8C00;
      text-shadow: 0 0 8px #FF8C0099;
      letter-spacing: 2px;
    `,
    smallGray: `
      font-size: 11px;
      color: #888;
      font-style: italic;
    `,
  };

  console.log(
    '%c⚠  STOP.',
    C.bigRed
  );

  console.log(
    '%cThis is a browser feature intended for developers.',
    C.bigOrange
  );

  console.log(
    '%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    C.red
  );

  console.log(
    '\n%cPRIVACY WARNING \n',
    C.bgRed + 'font-size:15px; letter-spacing:2px; padding: 6px 20px;'
  );

  console.log(
    '%cDo %cNOT%c paste, share, or distribute ANY content visible in this console.',
    C.white,
    C.red + 'font-size:14px;',
    C.white
  );

  console.log(
    '%c• Session tokens, and auth credentials may be exposed here.',
    C.orange
  );
  console.log(
    '%c• Sharing this information can compromise your account and others.',
    C.orange
  );
  console.log(
    '%c• If someone told you to paste something here — you are being scammed.',
    C.yellow
  );

  console.log(
    '\n%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    C.red
  );

  console.log(
    '\n%c ⚖  LEGAL NOTICE — INTELLECTUAL PROPERTY \n',
    C.bgBlack + 'font-size:14px; letter-spacing:1.5px;'
  );

  console.log(
    '%cAll source code, assets, routes, API endpoints, and file paths',
    C.white
  );
  console.log(
    '%cvisible within this panel are the exclusive intellectual property',
    C.white
  );
  console.log(
    '%cof their respective owners and are protected under copyright law.',
    C.white
  );

  console.log('\n%cUnauthorized actions include — but are not limited to:', C.cyan);

  const violations = [
    '  X  Scraping, copying, or redistributing source code or assets',
    '  X  Reverse engineering API routes, endpoints, or data structures',
    '  X  Downloading, cloning, or mirroring site assets without permission',
    '  X  Using internal paths or configs for competitive intelligence',
    '  X  Automated crawling of protected resources',
  ];

  violations.forEach(v => console.log('%c' + v, C.orange));

  console.log(
    '\n%cENFORCEMENT:',
    C.red + 'font-size:13px; letter-spacing:1px;'
  );
  console.log(
    '%cViolation of these terms will result in an immediate %cCEASE & DESIST%c\n' +
    'followed by pursuit of all available legal remedies including DMCA\n' +
    'takedowns, civil litigation, and referral to law enforcement.',
    C.white,
    C.red + 'font-weight:900; font-size:13px; text-decoration:underline;',
    C.white
  );

  console.log(
    '\n%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    C.red
  );

  console.log(
    '\n%cAre you an authentic developer?',
    C.green + 'font-size:13px;'
  );
  console.log(
    '%cAwesome. Check out our careers page or reach out via official channels.',
    C.gray
  );

  console.log(
    '%c© ' + new Date().getFullYear() + ' — All Rights Reserved.\n',
    C.smallGray
  );

})();
