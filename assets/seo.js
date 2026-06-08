/* Mbeya Forest Hill Motel — shared SEO (reads window.CARMELINA_SEO per page) */
(function(){
  const cfg = window.CARMELINA_SEO || {};
  const SITE = {
    name: 'Mbeya Forest Hill Motel',
    email: 'mbeyaforesthillmotel2025@gmail.com',
    phone: '+255718541688',
    defaultImage: './assets/images/hero-section-image.jpg',
    fallbackOrigin: 'https://mbeyaforesthillmotel.com',
    geo: { lat: -8.909335, lng: 33.460731 },
    address: {
      street: 'Forest Hill Road, P.O. Box 2237',
      city: 'Mbeya',
      region: 'Mbeya',
      postal: '2237',
      country: 'TZ',
    },
    sameAs: [
      'https://www.facebook.com/profile.php?id=61586840549038',
      'https://www.instagram.com/mbeyaforesthillmotel/',
    ],
  };

  function siteBase(){
    if(location.protocol === 'file:' || /localhost|127\.0\.0\.1/.test(location.hostname))
      return SITE.fallbackOrigin;
    const seg = location.pathname.split('/').filter(Boolean);
    if(seg.length > 1 && seg[0].indexOf('.') === -1)
      return location.origin + '/' + seg[0];
    return location.origin;
  }

  function absUrl(path){
    const base = siteBase().replace(/\/$/, '');
    if(!path) return base + '/';
    if(/^https?:\/\//.test(path)) return path;
    return base + '/' + path.replace(/^\.\//, '').replace(/^\//, '');
  }

  function pageUrl(path){
    const p = path || cfg.path || 'index.html';
    if(p === 'index.html' || p === '/') return siteBase().replace(/\/$/, '') + '/';
    return absUrl(p);
  }

  function setMeta(key, content, useProperty){
    if(!content) return;
    const attr = useProperty ? 'property' : 'name';
    let el = document.querySelector('meta[' + attr + '="' + key + '"]');
    if(!el){
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function setJsonLd(id, data){
    let el = document.getElementById(id);
    if(!el){
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  function inject(){
    const title = cfg.title || document.title;
    const desc = cfg.description || 'Comfortable hotel in Mbeya, Tanzania — air-conditioned rooms, indoor pool, restaurant, and free airport shuttle near Mbeya Airport.';
    const url = pageUrl(cfg.path);
    const image = absUrl(cfg.image || SITE.defaultImage);
    const keywords = cfg.keywords || 'Mbeya hotel, Forest Hill Motel, Mbeya accommodation, Tanzania hotel, Mbeya airport hotel, hotel Mbeya Tanzania';

    document.title = title;
    setMeta('description', desc);
    setMeta('keywords', keywords);
    setMeta('robots', cfg.robots || 'index, follow');
    setMeta('author', SITE.name);
    setMeta('geo.region', 'TZ-14');
    setMeta('geo.placename', 'Mbeya');
    setMeta('geo.position', SITE.geo.lat + ';' + SITE.geo.lng);
    setMeta('ICBM', SITE.geo.lat + ', ' + SITE.geo.lng);

    let canonical = document.querySelector('link[rel="canonical"]');
    if(!canonical){
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    let sitemap = document.querySelector('link[rel="sitemap"]');
    if(!sitemap){
      sitemap = document.createElement('link');
      sitemap.rel = 'sitemap';
      sitemap.type = 'application/xml';
      sitemap.href = absUrl('sitemap.xml');
      document.head.appendChild(sitemap);
    }

    setMeta('og:title', title, true);
    setMeta('og:description', desc, true);
    setMeta('og:url', url, true);
    setMeta('og:type', cfg.type || 'website', true);
    setMeta('og:site_name', SITE.name, true);
    setMeta('og:image', image, true);
    setMeta('og:locale', 'en_TZ', true);

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', desc);
    setMeta('twitter:image', image);

    if(cfg.schema !== false){
      setJsonLd('fh-schema-hotel', {
        '@context': 'https://schema.org',
        '@type': 'Hotel',
        '@id': pageUrl('index.html') + '#hotel',
        name: SITE.name,
        description: desc,
        url: pageUrl('index.html'),
        image: image,
        telephone: SITE.phone,
        email: SITE.email,
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          streetAddress: SITE.address.street,
          addressLocality: SITE.address.city,
          addressRegion: SITE.address.region,
          postalCode: SITE.address.postal,
          addressCountry: SITE.address.country,
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: SITE.geo.lat,
          longitude: SITE.geo.lng,
        },
        sameAs: SITE.sameAs,
        amenityFeature: [
          { '@type': 'LocationFeatureSpecification', name: 'Free WiFi', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Indoor swimming pool', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Free airport shuttle', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Restaurant', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Free parking', value: true },
        ],
      });
    }

    if(cfg.breadcrumb && cfg.breadcrumb.length){
      setJsonLd('fh-schema-breadcrumb', {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: cfg.breadcrumb.map(function(item, i){
          return {
            '@type': 'ListItem',
            position: i + 1,
            name: item.name,
            item: pageUrl(item.path),
          };
        }),
      });
    } else {
      const crumb = document.getElementById('fh-schema-breadcrumb');
      if(crumb) crumb.remove();
    }

    if(cfg.roomSchema){
      setJsonLd('fh-schema-room', cfg.roomSchema);
    } else {
      const room = document.getElementById('fh-schema-room');
      if(room) room.remove();
    }
  }

  window.CARMELINA_UPDATE_SEO = function(patch){
    Object.assign(cfg, patch || {});
    inject();
  };

  inject();
})();
