# 🔍 Guide de Débogage des Emails

## Problème : Le système dit que l'email est envoyé mais vous ne recevez rien

### ✅ Ce qui a été corrigé

1. **Vérification SMTP avant envoi** : Le système vérifie maintenant la connexion SMTP avant d'essayer d'envoyer
2. **Vérification robuste de l'envoi** : On vérifie non seulement le `messageId` mais aussi :
   - Si l'email a été accepté par le serveur SMTP
   - Si l'email n'a pas été rejeté
   - La réponse du serveur SMTP
3. **Logs détaillés** : Tous les détails sont maintenant loggés dans la console serveur

## 🔍 Comment vérifier ce qui se passe

### 1. Vérifier les logs du serveur

Après avoir soumis le formulaire de contact, regardez la console du serveur. Vous devriez voir :

```
🔍 Verifying SMTP connection...
✅ SMTP connection verified successfully
📧 Attempting to send emails...
📧 Sending admin email to: contact@tagit.ma
✅ Admin email sent successfully: {
  messageId: '...',
  accepted: [ 'contact@tagit.ma' ],
  response: '250 2.0.0 OK ...'
}
📧 Sending client email to: client@example.com
✅ Client email sent successfully: {
  messageId: '...',
  accepted: [ 'client@example.com' ],
  response: '250 2.0.0 OK ...'
}
📧 Email sending result: {
  "adminSent": true,
  "clientSent": true
}
```

### 2. Erreurs possibles

#### ❌ Erreur : "SMTP verification failed"

```
❌ SMTP verification failed: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solution** :
- Vérifiez vos identifiants SMTP dans `.env`
- Pour Gmail, utilisez un [mot de passe d'application](https://support.google.com/accounts/answer/185833)
- Vérifiez que `SMTP_USER` et `SMTP_PASS` sont corrects

#### ❌ Erreur : "Email rejected"

```
❌ Admin email not properly sent: {
  rejected: [ 'contact@tagit.ma' ],
  reason: 'Rejected: 550 5.1.1 User unknown'
}
```

**Solution** :
- L'adresse email n'existe pas
- Vérifiez que `CONTACT_EMAIL` dans `.env` est correct

#### ❌ Erreur : "No messageId"

```
❌ Admin email not properly sent: {
  messageId: null,
  reason: 'No messageId or accepted recipients'
}
```

**Solution** :
- Le serveur SMTP n'a pas accepté l'email
- Vérifiez la configuration SMTP
- Vérifiez les logs pour plus de détails

### 3. Vérifier votre configuration `.env`

```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app  # ⚠️ Important : mot de passe d'application pour Gmail
EMAIL_FROM=noreply@tagit.ma
CONTACT_EMAIL=contact@tagit.ma
```

### 4. Test Gmail spécifique

Si vous utilisez Gmail :

1. **Activer l'authentification à 2 facteurs** (nécessaire pour les mots de passe d'application)
2. **Créer un mot de passe d'application** :
   - Aller sur https://myaccount.google.com/apppasswords
   - Créer un mot de passe pour "Mail"
   - Utiliser ce mot de passe dans `SMTP_PASS` (pas votre mot de passe Gmail normal)
3. **Vérifier que l'email FROM est le même que SMTP_USER** (Gmail le requiert)

### 5. Pourquoi le test SMTP fonctionne mais pas l'envoi réel ?

Si votre test SMTP fonctionne mais que les emails du formulaire ne sont pas reçus :

1. **Vérifiez les logs** : Regardez si les emails sont marqués comme envoyés
2. **Vérifiez vos spams** : Les emails peuvent être filtrés
3. **Vérifiez que `EMAIL_FROM` est correct** : Certains serveurs SMTP rejettent si FROM ne correspond pas au compte
4. **Vérifiez la réponse SMTP** : Dans les logs, regardez la ligne `response` pour voir ce que dit le serveur

### 6. Checklist de débogage

- [ ] Les logs montrent "✅ SMTP connection verified successfully"
- [ ] Les logs montrent "✅ Admin email sent successfully" avec un `messageId`
- [ ] Le champ `accepted` contient l'adresse email
- [ ] Le champ `rejected` est vide ou undefined
- [ ] La `response` commence par "250" (succès)
- [ ] Aucune erreur dans les logs du serveur
- [ ] Vérifié les spams dans la boîte de réception
- [ ] `EMAIL_FROM` correspond à `SMTP_USER` (pour Gmail)
- [ ] Utilisé un mot de passe d'application pour Gmail (pas le mot de passe normal)

## 📝 Messages d'erreur courants

### "535-5.7.8 Username and Password not accepted"
→ Identifiants SMTP incorrects ou mot de passe d'application manquant

### "550 5.1.1 User unknown"
→ L'adresse email destinataire n'existe pas

### "550 5.7.1 Mail relay denied"
→ Le serveur SMTP ne permet pas d'envoyer depuis cette adresse

### "Connection timeout"
→ Le serveur SMTP n'est pas accessible (vérifiez HOST et PORT)

### "Email service may not be properly configured"
→ La variable `EMAIL_SERVICE` n'est pas définie ou incorrecte

## 🚀 Test rapide

Pour tester rapidement :

1. Ouvrez la console du serveur
2. Soumettez le formulaire de contact
3. Regardez les logs détaillés
4. Si vous voyez des erreurs, suivez les solutions ci-dessus

Les logs vous diront exactement ce qui ne va pas !

