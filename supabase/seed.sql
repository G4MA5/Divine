-- ============================================================================
--  [div_dev_Now] — données actuelles du site (généré par scripts/export-sql.mjs)
--  À exécuter après schema.sql. Ne remplace jamais une ligne déjà présente.
-- ============================================================================

insert into public.identite (id, prenom, nom, magazine, titre, accroches, passions, ville, email, telephone, afficher_telephone, github, instagram, whatsapp, linkedin, cv_url, portrait_url, numero, langues, centres_interet) values
  (1, 'Divine', 'GRAOUROU Olivier Grace Divine', '[div_dev_Now]', 'Développeuse full stack | DevOps junior | Support IT junior', array['Développeuse full stack', 'DevOps junior', 'Support IT junior']::text[], array['Backend', 'DevOps', 'Vision par ordinateur', 'IoT']::text[], 'Abidjan, Côte d''Ivoire', 'Graouroudivine@gmail.com', '(+225) 07 78 30 42 87', true, 'https://github.com/divine-dev-now/', 'https://www.instagram.com/divin____e/', 'https://wa.me/2250778304287', '', '/cv/cv-divine.pdf', '/images/portrait.png', 'N° 01', '[{"langue":"Français","niveau":"courant"},{"langue":"Anglais","niveau":"niveau A2"}]'::jsonb, array['Lecture', 'Kung-fu', 'Tennis', 'Musique', 'Cuisine']::text[])
on conflict (id) do nothing;

insert into public.edito (id, titre, texte, signature) values
  (1, 'Édito', 'Développeuse web et mobile backend, passionnée par le DevOps, la vision par ordinateur et les technologies IoT, je suis constamment en quête d''apprentissage et de nouveaux défis technologiques.

Membre de GAMA Labs et étudiante en Master Ingénierie Cybersécurité et IA, je crois en l''innovation, la créativité et la puissance de la technologie pour résoudre des problèmes réels. J''aime concevoir des solutions utiles, modernes et intelligentes.

Ma conviction est simple : chaque grande innovation commence par une idée et la volonté de la rendre réelle.', 'Divine')
on conflict (id) do nothing;

insert into public.reglages (cle, valeur) values
  ('peinture.titre', 'Divine à la peinture'),
  ('peinture.chapo', 'Quand je ne code pas, je peins.')
on conflict (cle) do nothing;

insert into public.parcours (id, position, periode, titre, lieu, detail, branche) values
  ('baccalaureat-general-serie-d', 1, '2022-2023', 'Baccalauréat Général, série D', 'Collège Pascal de Koumassi', '', false),
  ('licence-miage', 2, '2023-2026', 'Licence MIAGE', 'Université Polytechnique de Bingerville (UPB)', 'Méthodes Informatiques Appliquées à la Gestion des Entreprises', false),
  ('certificat-speaking-and-presenting-conve', 3, 'Avril 2024', 'Certificat « Speaking and Presenting – Conversation Starters »', 'Université du Michigan, via MTN Skills Academy', '', true),
  ('master-ingenierie-cybersecurite-et-ia', 4, 'Depuis 2026', 'Master Ingénierie Cybersécurité et IA', 'Université Polytechnique de Bingerville (UPB)', '', false)
on conflict (id) do nothing;

insert into public.experiences (id, position, periode, poste, entreprise, lieu, resume, missions, lien_texte, lien_href, fond, accent, logo_url, monogramme) values
  ('gama', 1, 'Depuis 2023', 'Co-fondatrice', 'GAMA Labs', 'Abidjan', 'Studio de sites, d''applications et de logiciels sur mesure, créé en 2023 avec cinq autres ingénieurs. Apprendre · Créer · Impacter.', array['Sites web, applications web et applications mobiles (Flutter) livrés de l''analyse au déploiement', 'Une méthode en sept étapes : analyse, spécification, conception, design, code, test, déploiement', 'Des projets pour l''UPB et ses étudiants : Génie UPB, UpB Student''s, Metro']::text[], 'gama-labs.com', 'https://gama-labs.com', '#fdf1c9', '#d99a00', '/images/logos/logo-gama-cube.webp', 'G'),
  ('bde', 2, 'Année scolaire 2025-2026', 'Secrétaire générale du BDE', 'Bureau des étudiants, 6e promotion de l''UPB', 'Bingerville', '', array['Rédaction des comptes rendus et suivi administratif du bureau', 'Relais entre les étudiants et l''administration de l''université']::text[], '', '', '#dff0e3', '#2f7d4f', '/images/logos/upb-logo.webp', 'BDE'),
  ('transsion', 3, 'Juin 2024 – Décembre 2024', 'Data Annotator', 'Transsion Holding', 'Abidjan', '', array['Transcription de données audio en texte', 'Contribution à l''amélioration d''un assistant vocal', 'Travail sur des données réelles et amélioration de modèles']::text[], '', '', '#dfeaf9', '#2b5fb8', '', 'T'),
  ('ttsc', 4, 'Mai 2026 – Novembre 2026', 'Support IT', 'Top Telecom Services', 'Abidjan', '', array['Tests du logiciel CONTEOPRO (ERP de gestion hôtelière et restauration)', 'Formation des utilisateurs de CONTEOPRO', 'Assistance client']::text[], '', '', '#fbe3da', '#c4502a', '', 'TTS')
on conflict (id) do nothing;

insert into public.projets (slug, position, publie, titre, taille_titre, rubrique, chapo, description, stack, fonctionnalites, date_projet, role, equipe, statut, lien, format, captures, couverture) values
  ('clinique-life', 1, true, 'Clinique Life', '12.5cqw', 'Site web médical', 'Un site vitrine pour une clinique, avec prise de rendez-vous en ligne et un tableau de bord pour l''administration.', 'Site vitrine avec système de prise de rendez-vous et dashboard admin. Réalisé en équipe avec GAMA LABS, de la conception à la mise en production.', '{}'::text[], array['Prise de rendez-vous en ligne', 'Tableau de bord d''administration']::text[], '', 'Backend / API, analyse et conception', 'GAMA LABS', 'Mis en production', '', 'web', '{}'::text[], '{"theme":"mint","disposition":"bottom","grand":[{"t":"RDV"},{"t":"EN LIGNE","accent":true}],"petit":["Rendez-vous","Dashboard admin"],"credit":"Site web","art":"rdv"}'::jsonb),
  ('genie-upb-admin', 2, true, 'Génie UPB Admin', '10cqw', 'Application mobile & web', 'Le système qui inscrit et valide les participants du concours d''innovation de l''Université Polytechnique de Bingerville.', 'Système d''inscription et de validation des participants, développé pour le concours d''innovation GeniUPB de l''Université Polytechnique de Bingerville. Projet officiel réalisé avec l''équipe GAMA LABS.', array['Python', 'FastAPI', 'PostgreSQL', 'Flutter', 'Render', 'Resend']::text[], array['Gestion des inscriptions', 'Contrôle d''accès par QR Code', 'Suivi en temps réel', 'Notifications automatisées']::text[], 'Janvier 2026', '', 'GAMA LABS', 'Projet officiel', '', 'web', '{}'::text[], '{"theme":"bone","disposition":"bottom","chevauche":true,"grand":[{"t":"QR"},{"t":"CODE !"}],"petit":["Inscriptions","Temps réel"],"credit":"FastAPI","art":"qr"}'::jsonb),
  ('upb-students', 3, true, 'UPB Student''s', '10.6cqw', 'Application mobile et site bibliothèque', 'Une application pour les étudiants, les parents et l''administration, pensée comme un SaaS évolutif.', 'Application pour étudiants, parents et administration (Flutter, Firebase), gestion des profils, architecture SaaS évolutive. Une version site web de bibliothèque est publiée en ligne.', array['Flutter', 'Firebase']::text[], array['Synchronisation cloud', 'Emploi du temps', 'Mode hors-ligne', 'Site web de la bibliothèque']::text[], 'Septembre 2023', '', '', 'Site bibliothèque publié', '', 'web', '{}'::text[], '{"theme":"blue","disposition":"bottom","grand":[{"t":"BIBLIO-"},{"t":"THÈQUE"}],"petit":["En ligne","Publié"],"credit":"Site web","art":"library"}'::jsonb),
  ('inventist', 4, true, 'Inventist', '14.5cqw', 'Application de gestion de stock', 'Le suivi des produits d''un salon de coiffure, en conditions réelles.', 'Application mobile de gestion de stock, pensée principalement pour les salons de coiffure. En cours de déploiement au salon PELA Hair.', '{}'::text[], array['Gestion de stock', 'Pensée pour les salons de coiffure']::text[], '', 'Réalisé seule, de bout en bout', '', 'En cours de déploiement chez PELA Hair', '', 'mobile', '{}'::text[], '{"theme":"black","disposition":"vertical","chevauche":true,"grand":[{"t":"STOCK"},{"t":"SALON","accent":true}],"petit":["Gestion de stock","Salons de coiffure"],"credit":"App mobile","art":"stock"}'::jsonb),
  ('canopee', 5, true, 'Canopée', '16.5cqw', 'Gestion du SAV de CONTEOPRO', 'Plateforme de gestion du service SAV du logiciel CONTEOPRO, réalisée pendant mon stage chez Top Telecom Services.', 'Canopée permet de gérer le service après-vente (SAV) du logiciel CONTEOPRO. Ce projet a été réalisé dans le cadre de mon stage chez Top Telecom Services (anciennement appelé CONTEOPRO SAV).', array['FastAPI', 'React', 'Supabase']::text[], array['Gestion du service SAV', 'Tickets d''assistance', 'Missions et rapports']::text[], '', 'Développé seule, de bout en bout', 'Top Telecom Services', '', '', 'web', '{}'::text[], '{"theme":"green","disposition":"bottom","grand":[{"t":"S.A.V."}],"petit":["Logiciel","CONTEOPRO"],"credit":"Projet de stage","art":"tickets"}'::jsonb),
  ('metro', 6, true, 'Metro', '24cqw', 'Algorithmes et architecture', 'Une architecture moderne avec routage dynamique et authentification JWT.', 'Projet basé sur une architecture moderne avec authentification et visualisation.', array['FastAPI', 'Docker']::text[], array['Routage dynamique', 'Authentification JWT', 'Visualisation']::text[], '', 'Backend / API, analyse', '', '', '', 'web', '{}'::text[], '{"theme":"red","disposition":"vertical","grand":[{"t":"ROUTAGE"},{"t":"DYNAMIQUE","accent":true}],"petit":["Auth JWT","Visualisation"],"credit":"FastAPI","art":"metro"}'::jsonb)
on conflict (slug) do nothing;

insert into public.competences (id, position, categorie, items) values
  ('mobile', 1, 'Mobile', array['Flutter', 'Firebase']::text[]),
  ('web', 2, 'Web', array['HTML', 'CSS', 'React.js', 'Next.js']::text[]),
  ('backend', 3, 'Backend', array['Spring Boot', 'API REST']::text[]),
  ('langages', 4, 'Langages', array['Dart', 'Java', 'Python', 'R']::text[]),
  ('bases-de-donnees', 5, 'Bases de données', array['Oracle', 'SQL', 'PostgreSQL', 'NoSQL']::text[]),
  ('outils', 6, 'Outils', array['Git', 'Supabase', 'Word', 'Excel', 'PowerPoint', 'Power BI']::text[]),
  ('devsecops', 7, 'DevSecOps', array['Git', 'GitHub Actions', 'Docker', 'Trivy', 'SonarQube', 'OWASP ZAP', 'Gitleaks', 'Dependabot']::text[]),
  ('securite', 8, 'Sécurité', array['JWT', 'RLS Supabase', 'Règles Firebase', 'OWASP Top 10']::text[])
on conflict (id) do nothing;

insert into public.atouts (id, position, texte) values
  ('atout-1', 1, 'Esprit d''équipe'),
  ('atout-2', 2, 'Capacité d''adaptation'),
  ('atout-3', 3, 'Organisation et gestion des priorités'),
  ('atout-4', 4, 'Sérieuse et motivée')
on conflict (id) do nothing;

insert into public.recette (id, titre, sous_titre, intro, temps, difficulte, pour, ingredients) values
  (1, 'La Recette', 'Comment je transforme une idée en logiciel', 'Une recette, c''est des ingrédients et un ordre. Un projet aussi : on ne saute pas d''étape, et on goûte avant de servir.', 'Du brief à la mise en ligne', 'Elle se corse avec le cahier des charges', '1 projet, 1 équipe', array['Un besoin bien compris', 'Une équipe qui s''écoute', 'Du Git à volonté', 'Du code propre', 'Des tests', 'Une pincée de sécurité', 'Un déploiement soigné']::text[])
on conflict (id) do nothing;

insert into public.recette_etapes (id, position, nom, texte) values
  ('etape-1', 1, 'Analyser', 'Comprendre le vrai besoin : qui utilisera le produit, pourquoi, et ce qui existe déjà.'),
  ('etape-2', 2, 'Spécifier', 'Écrire ce que le produit doit faire et dans quel ordre, avant d''écrire la moindre ligne de code.'),
  ('etape-3', 3, 'Concevoir', 'Dessiner l''architecture, le modèle de données et l''API : diagrammes UML, schémas, choix techniques.'),
  ('etape-4', 4, 'Dessiner', 'Maquetter les écrans et les parcours, choisir la typographie et les couleurs : ça doit être beau et clair.'),
  ('etape-5', 5, 'Coder', 'Une branche Git par fonctionnalité, de petits commits, des relectures. Le backend d''abord, l''interface ensuite.'),
  ('etape-6', 6, 'Tester', 'Tester, corriger, puis vérifier la sécurité (analyse du code et des dépendances) avant de livrer.'),
  ('etape-7', 7, 'Déployer', 'Mettre en ligne de façon automatisée (CI/CD), puis écouter les retours des utilisateurs pour la version suivante.')
on conflict (id) do nothing;

insert into public.interview (id, position, question, reponse) overriding system value values
  (1, 1, 'Pourquoi le backend ?', 'Parce que c''est là que la logique prend vie : les données, les règles, la sécurité. J''aime construire ce qu''on ne voit pas mais sur lequel tout repose, et qu''une application tienne la route quand les utilisateurs arrivent.'),
  (2, 2, 'Comment es-tu passée de la MIAGE à la cybersécurité et l''IA ?', 'La MIAGE m''a appris à relier le code aux besoins des entreprises. Plus je construisais d''applications, plus la question de les protéger et de les rendre intelligentes s''imposait : le master en cybersécurité et IA est la suite logique.'),
  (3, 3, 'Quel projet te rend la plus fière ?', 'Ceux que j''ai portés de bout en bout, comme Inventist et Canopée : de l''analyse au déploiement, seule aux commandes. On apprend énormément quand chaque décision est la sienne.'),
  (4, 4, 'Qu''as-tu appris en annotant des données pour un assistant vocal ?', 'Que la qualité d''un modèle dépend de la qualité de ses données. Transcrire des enregistrements avec précision, c''est aider directement un assistant vocal à mieux comprendre les gens.'),
  (5, 5, 'C''est quoi, travailler en équipe chez GAMA LABS ?', 'Nous sommes six ingénieurs et nous livrons de l''analyse au déploiement, avec une méthode en sept étapes. Chacun apporte ses forces, on se relit, on apprend les uns des autres : apprendre, créer, impacter.'),
  (6, 6, 'Le kung-fu, ça t''apporte quoi dans ton travail ?', 'De la discipline et du calme. Répéter un mouvement jusqu''à ce qu''il soit juste, c''est comme corriger un bug : de la patience, de la méthode, et ne pas lâcher.'),
  (7, 7, 'Tennis ou code : où es-tu la plus stratège ?', 'Les deux demandent d''anticiper. Au tennis, on lit le jeu avant de frapper ; en code, on pense l''architecture avant d''écrire. Au code, je suis plus stratège : j''ai le temps de réfléchir.'),
  (8, 8, 'Qu''est-ce que tu lis en ce moment ?', ''),
  (9, 9, 'Ton plat signature ?', ''),
  (10, 10, 'Qu''écoutes-tu quand tu codes ?', ''),
  (11, 11, 'Où te vois-tu dans cinq ans ?', 'Ingénieure en cybersécurité et IA, à concevoir des systèmes fiables et sûrs, avec un GAMA Labs qui a grandi et des projets qui ont un vrai impact.'),
  (12, 12, 'Pourquoi devrait-on travailler avec toi ?', 'Parce que je livre de bout en bout, que je sécurise ce que je construis et que je travaille bien en équipe. Et parce que j''apprends vite : un nouveau défi est une bonne nouvelle.')
on conflict (id) do nothing;
select setval(pg_get_serial_sequence('public.interview', 'id'), (select coalesce(max(id), 1) from public.interview));

insert into public.medias (id, nom, dossier, url, alt, type) values
  ('media-portrait', 'portrait.png', 'portrait', '/images/portrait.png', 'Portrait de Divine Graourou', 'image'),
  ('media-logo-gama-cube', 'logo-gama-cube.webp', 'logos', '/images/logos/logo-gama-cube.webp', 'Logo : GAMA Labs', 'image'),
  ('media-upb-logo', 'upb-logo.webp', 'logos', '/images/logos/upb-logo.webp', 'Logo : Bureau des étudiants, 6e promotion de l''UPB', 'image')
on conflict (id) do nothing;

insert into public.tableaux (id, position, titre, annee, technique, dimensions, image_url, ratio) values
  ('t1', 1, '', '', '', '', '', 0.75),
  ('t2', 2, '', '', '', '', '', 1.3333),
  ('t3', 3, '', '', '', '', '', 1),
  ('t4', 4, '', '', '', '', '', 0.75),
  ('t5', 5, '', '', '', '', '', 0.8),
  ('t6', 6, '', '', '', '', '', 1.25)
on conflict (id) do nothing;
