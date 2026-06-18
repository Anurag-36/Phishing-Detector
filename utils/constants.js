export const SUSPICIOUS_KEYWORDS = [
  'login','signin','verify','update','bank','secure','account','password','wallet','payment'
];

export const SHORTENERS = ['bit.ly','tinyurl.com','t.co','goo.gl','ow.ly'];

export const STORAGE_KEYS = {
  REPUTATION_CACHE: 'reputation_cache_v1'
};

export const OPENPHISH_FEED = 'https://openphish.com/feed.txt';
export const CRTSH_ENDPOINT = 'https://crt.sh/?q='; // usage: CRTSH_ENDPOINT + domain + '&output=json'

// Optional server proxy: set to your server URL if you deploy one. Leave empty to use direct lookups.
export const SERVER_PROXY = '';
