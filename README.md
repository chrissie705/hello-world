# hello-world
répertoire de test pour prise en main Github
Ajout de quelques infos pour vérifier le fonctionnement d'une branche

# lancer le batch
après avoir verifié les fichiers de config 
node/app/config/departements.json
node/app/config/mongoDbConf.json
node/app/config/propMapper.json
node/app/config/urlParams.json

lancer le batch avec la commande
```batch
node batch.js
```
# graph
verifier le parametrage du serveur graphql dans le fichier 
node/app/config/graphql.json
lancer le serveur graphql avec la commande
```
node index.js
```

la config par defaut lance le serveur grphql a l'url :
http://localhost:4000/graphql

la sandbox graphql se trouve à cette à cette même adresse.

## queries

la requete la plus basique est celle sui récupere toutes les activitées (et seulement leur nom)
```
query {
  allActivities{
  	name
	}
}
```
