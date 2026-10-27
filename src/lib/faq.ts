export const vaultFaq = [
  { q: 'Is Secure Vault available to download?', a: 'Not yet. It is in private beta. Join the waitlist and we will email you the download link when the beta opens.' },
  { q: 'How is my data encrypted?', a: 'The design uses AES-256-GCM. The encryption key is generated on your Mac and stays there; nothing is sent to our servers. This describes the planned behavior of the beta.' },
  { q: 'Can I unlock it with Touch ID?', a: 'Yes, that is part of the design, with a password fallback for Macs without Touch ID.' },
  { q: 'What happens if I forget my password?', a: 'Because the key stays on your Mac and we never hold it, we cannot recover your files. The plan is a recovery phrase that you store yourself.' },
  { q: 'How much will it cost?', a: 'The beta is free. We are planning a free tier and a one-time lifetime Pro purchase (about $29) rather than a subscription. Final pricing will be announced before launch.' },
  { q: 'Is the code open source?', a: 'We are deciding on the licence. Either way we plan to publish the encryption design so security-minded readers can check our claims before trusting them.' },
];
