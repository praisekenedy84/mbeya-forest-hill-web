/* ============================================================
   CARMELINA — shared site script
   Injects header + footer, handles nav, reveal, counters, booking
   Configure per page via window.CARMELINA = { active:'rooms', transparentHeader:true }
   ============================================================ */
(function(){
  const cfg = window.CARMELINA || {};
  const active = cfg.active || '';
  const transparent = !!cfg.transparentHeader;

  const CONTACT = {
    phone: '+255 718 541 688',
    phoneTel: '+255718541688',
    email: 'mbeyaforesthillmotel2025@gmail.com',
    addressHtml: 'Forest Hill Road<br>P.O. Box 2237, Mbeya, Tanzania',
    addressLine: 'Forest Hill Road, P.O. Box 2237, Mbeya, Tanzania — 1.9 km from Mbeya Airport.',
  };

  const FORM_GUEST_ERROR = 'We could not send your request right now. Please call +255 718 541 688 or email us directly.';

  /* FormSubmit.co — forwards static-site forms to CONTACT.email (verify inbox once on first use) */
  async function sendFormEmail(fields){
    if(location.protocol === 'file:'){
      throw new Error('Forms must be tested through a web server. In this folder run: npm start — then open http://localhost:8888');
    }
    const body = new FormData();
    Object.entries(Object.assign({ _captcha: 'false' }, fields)).forEach(([k, v]) => {
      if(v != null && v !== '') body.append(k, String(v));
    });
    const res = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(CONTACT.email), {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body,
    });
    const data = await res.json().catch(() => ({}));
    if(!res.ok || data.success === 'false' || data.success === false){
      if(data.message) console.warn('[FormSubmit]', data.message);
      throw new Error(FORM_GUEST_ERROR);
    }
    return data;
  }
  window.CARMELINA_FORMS = { email: CONTACT.email, send: sendFormEmail, guestError: FORM_GUEST_ERROR };

  /* ============================================================
     TWEAKS — palette / type / shape directions (persist across pages)
     ============================================================ */
  const PALETTES = {
    'Forest Hill Classic':  { bg:'#F8F6F2', alt:'#F0EBE3', paper:'#FFFFFF', ink:'#1A191D', soft:'#646464', faint:'#9A968E', accent:'#AA998A', adeep:'#8C7D6E', dark:'#1C2C34', dark2:'#142028', onDark:'#F0ECE6' },
    'Sand & Brass':       { bg:'#F7F2E9', alt:'#EFE6D8', paper:'#FCFAF5', ink:'#1D1A14', soft:'#4E4A40', faint:'#908975', accent:'#A6814B', adeep:'#866536', dark:'#1C1A15', dark2:'#25221B', onDark:'#EDE6D8' },
    'Cool Stone & Slate': { bg:'#F1F2F4', alt:'#E4E7EB', paper:'#FAFBFC', ink:'#1A1D21', soft:'#444A52', faint:'#878D96', accent:'#5E7891', adeep:'#455D72', dark:'#181B1F', dark2:'#21252A', onDark:'#E6E9ED' },
    'Deep Forest & Gold': { bg:'#F4F1E8', alt:'#E9E4D6', paper:'#FBF9F2', ink:'#15201B', soft:'#43504A', faint:'#8A938C', accent:'#B08A4A', adeep:'#8C6B33', dark:'#16241C', dark2:'#1E3127', onDark:'#E7E9E1' },
    'Charcoal & Champagne':{ bg:'#F4F3F1', alt:'#E7E5E1', paper:'#FBFAF8', ink:'#1A1916', soft:'#4A4843', faint:'#8C887F', accent:'#C2A678', adeep:'#9E8253', dark:'#1A1916', dark2:'#252320', onDark:'#EAE7E0' },
  };
  const FONTS = { 'Forum':"'Forum', Georgia, serif", 'Cormorant':"'Cormorant Garamond', Georgia, serif", 'Playfair':"'Playfair Display', Georgia, serif" };
  const SHAPES = { 'Sharp':'2px', 'Soft':'8px', 'Pill':'999px' };
  const RHYTHM = { 'Comfortable':'clamp(72px,11vh,132px)', 'Spacious':'clamp(96px,15vh,176px)' };
  const TWK_DEFAULTS = { palette:'Forest Hill Classic', font:'Forum', shape:'Sharp', rhythm:'Comfortable' };

  const TWK_VERSION = 'v4';
  function readTweaks(){
    try{
      if(localStorage.getItem('carmelina-twk-ver')!==TWK_VERSION){ localStorage.removeItem('carmelina-tweaks'); localStorage.setItem('carmelina-twk-ver',TWK_VERSION); }
      return Object.assign({}, TWK_DEFAULTS, JSON.parse(localStorage.getItem('carmelina-tweaks')||'{}'));
    }catch(e){ return Object.assign({},TWK_DEFAULTS); }
  }
  function saveTweaks(t){ try{ localStorage.setItem('carmelina-tweaks', JSON.stringify(t)); localStorage.setItem('carmelina-twk-ver',TWK_VERSION); }catch(e){} }
  function hexA(hex,a){ const n=parseInt(hex.slice(1),16); return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`; }

  function applyTweaks(t){
    const r=document.documentElement.style, p=PALETTES[t.palette]||PALETTES['Forest Hill Classic'];
    r.setProperty('--bg',p.bg); r.setProperty('--bg-alt',p.alt); r.setProperty('--paper',p.paper);
    r.setProperty('--ink',p.ink); r.setProperty('--ink-soft',p.soft); r.setProperty('--ink-faint',p.faint);
    r.setProperty('--line',hexA(p.ink,.14)); r.setProperty('--line-soft',hexA(p.ink,.08));
    r.setProperty('--accent',p.accent); r.setProperty('--accent-deep',p.adeep);
    r.setProperty('--dark',p.dark); r.setProperty('--dark-2',p.dark2);
    r.setProperty('--on-dark',p.onDark); r.setProperty('--on-dark-soft',hexA(p.onDark,.62));
    r.setProperty('--font-display',FONTS[t.font]||FONTS['Forum']);
    r.setProperty('--radius',SHAPES[t.shape]||'2px');
    r.setProperty('--sect',RHYTHM[t.rhythm]||RHYTHM['Comfortable']);
  }
  let TWK = readTweaks();
  applyTweaks(TWK); // apply ASAP to minimize flash

  function buildTweakPanel(){
    const wrap=document.createElement('div'); wrap.className='twkp'; wrap.setAttribute('data-twkp',''); wrap.setAttribute('data-no-i18n','');
    const swatch=name=>{ const p=PALETTES[name]; return `<span class="tw-sw" style="background:linear-gradient(135deg,${p.bg} 0 50%,${p.dark} 50% 100%);box-shadow:inset 0 0 0 6px ${p.accent}"></span>`; };
    const seg=(key,opts)=>opts.map(o=>`<button data-k="${key}" data-v="${o}" class="${TWK[key]===o?'on':''}">${o}</button>`).join('');
    wrap.innerHTML=`
      <div class="twkp-hd"><b>Tweaks</b><button class="twkp-x" data-twk-close>×</button></div>
      <div class="twkp-body">
        <div class="twkp-sect">Palette</div>
        <div class="twkp-pal">${Object.keys(PALETTES).map(n=>`<button class="twkp-palbtn ${TWK.palette===n?'on':''}" data-k="palette" data-v="${n}">${swatch(n)}<span>${n}</span></button>`).join('')}</div>
        <div class="twkp-sect">Heading Typeface</div>
        <div class="twkp-seg">${seg('font',Object.keys(FONTS))}</div>
        <div class="twkp-sect">Corner Style</div>
        <div class="twkp-seg">${seg('shape',Object.keys(SHAPES))}</div>
        <div class="twkp-sect">Spacing</div>
        <div class="twkp-seg">${seg('rhythm',Object.keys(RHYTHM))}</div>
      </div>`;
    wrap.addEventListener('click',e=>{
      const b=e.target.closest('[data-k]'); if(b){ TWK[b.dataset.k]=b.dataset.v; saveTweaks(TWK); applyTweaks(TWK);
        wrap.querySelectorAll(`[data-k="${b.dataset.k}"]`).forEach(x=>x.classList.remove('on')); b.classList.add('on');
        try{ window.parent.postMessage({type:'__edit_mode_set_keys', edits:{[b.dataset.k]:b.dataset.v}},'*'); }catch(_){}
      }
      if(e.target.closest('[data-twk-close]')){ wrap.classList.remove('open'); try{ window.parent.postMessage({type:'__edit_mode_dismissed'},'*'); }catch(_){} }
    });
    document.body.appendChild(wrap);
    const onMsg=ev=>{ const ty=ev&&ev.data&&ev.data.type; if(ty==='__activate_edit_mode') wrap.classList.add('open'); else if(ty==='__deactivate_edit_mode') wrap.classList.remove('open'); };
    window.addEventListener('message',onMsg);
    try{ window.parent.postMessage({type:'__edit_mode_available'},'*'); }catch(_){}
  }

  /* ============================================================
     i18n — English / Swahili toggle
     Translates text nodes + key attributes from the English source
     using the dictionary below. Choice persists across pages and is
     re-applied to dynamically rendered content via a MutationObserver.
     ============================================================ */
  const I18N_DICT = {
    /* --- navigation, header, footer --- */
    "Home":"Mwanzo","Rooms":"Vyumba","Experiences":"Huduma","Gallery":"Picha","About":"Kuhusu","Contact":"Mawasiliano",
    "Our Rooms":"Vyumba Vyetu","About Us":"Kuhusu Sisi","Explore":"Gundua","Payment Methods":"Njia za Malipo",
    "Book Room":"Weka Chumba","Book Your Stay":"Weka Malazi Yako","Login":"Ingia","Register":"Jisajili",
    "Find Us":"Tupate","Terms of Use":"Masharti ya Matumizi","Privacy Policy":"Sera ya Faragha",
    "Tel. +255 718 541 688":"Simu. +255 718 541 688","Check-in: 10:00 — 23:00":"Kuingia: 10:00 — 23:00",
    "© 2026 Mbeya Forest Hill Motel. All rights reserved.":"© 2026 Mbeya Forest Hill Motel. Haki zote zimehifadhiwa.",
    "We accept Visa, Mastercard, American Express, and cash on-site.":"Tunapokea Visa, Mastercard, American Express, na fedha taslimu hapa hapa.",
    "Nestled in the hills of Mbeya, Tanzania — offering comfortable rooms, an indoor pool, restaurant, and warm Tanzanian hospitality just 1.9 km from Mbeya Airport.":"Iliyoko katika milima ya Mbeya, Tanzania — ikitoa vyumba vya starehe, bwawa la kuogelea la ndani, mkahawa, na ukarimu wa joto wa Kitanzania kwa umbali wa kilomita 1.9 tu kutoka Uwanja wa Ndege wa Mbeya.",
    /* --- auth modal --- */
    "Welcome back":"Karibu tena","Sign in to your hotel account.":"Ingia kwenye akaunti yako ya hoteli.",
    "Username":"Jina la mtumiaji","Password":"Nywila","Remember me":"Nikumbuke","Forgot password?":"Umesahau nywila?",
    "Not registered yet?":"Bado hujajisajili?","Create an account":"Fungua akaunti","Become a member":"Kuwa mwanachama",
    "Enjoy exclusive privileges & member rates.":"Furahia manufaa maalum na bei za wanachama.","User Name":"Jina la Mtumiaji",
    "Email":"Barua pepe","Register Account":"Sajili Akaunti","Already have an account?":"Una akaunti tayari?",
    /* --- units / room meta (dynamic) --- */
    "From":"Kuanzia","TZS / night":"TZS / usiku","/ night":"/ usiku","night":"usiku","nights":"usiku",
    "Guests":"Wageni","Guest":"Mgeni","guests":"wageni","Beds":"Vitanda","Bed":"Kitanda","beds":"vitanda","bed":"kitanda",
    "Capacity":"Uwezo","Capacity:":"Uwezo:","Beds:":"Vitanda:","Rate":"Bei","rooms available":"vyumba vinapatikana",
    "Details":"Maelezo","More Details →":"Maelezo Zaidi →","Book":"Weka","Sleeps":"Hulala",
    "Adult":"Mtu mzima","Adults":"Watu wazima","Child":"Mtoto","Children":"Watoto",
    /* --- room names --- */
    "VIP Suite":"Suite ya VIP","Family Room with Balcony":"Chumba cha Familia chenye Baraza",
    "Standard Premium Room":"Chumba cha Kawaida Premium","Standard Room":"Chumba cha Kawaida","Junior Bedroom":"Chumba Kidogo",
    /* --- room features --- */
    "2 Beds":"Vitanda 2","4 Beds":"Vitanda 4","1 Bed":"Kitanda 1","1 King Size Bed":"Kitanda cha Ukubwa wa Mfalme","Meeting Room":"Chumba cha Mikutano",
    "Private Kitchen":"Jiko Binafsi","Dining":"Sehemu ya Kulia","Wi-Fi & Fridge":"Wi-Fi na Friji","TV":"TV",
    "Balcony":"Baraza","Comfortable Sofa":"Kochi la Starehe","Dressing Table":"Meza ya Kujipamba",
    "Fridge":"Friji","Private Veranda":"Veranda Binafsi",
    "Complimentary Breakfast":"Kifungua kinywa cha Bure","High-Speed Wi-Fi":"Wi-Fi ya Kasi",
    "Free Airport Shuttle":"Usafiri wa Bure wa Uwanja wa Ndege","Free Private Parking":"Maegesho Binafsi ya Bure",
    "Pool & Sauna Access":"Bwawa & Sauna","Room Features":"Sifa za Chumba",
    /* --- room descriptions --- */
    "Our finest accommodation — a spacious suite with two beds, a private meeting room, full kitchen and dining area for a complete home-away-from-home stay.":"Malazi yetu bora — suite pana yenye vitanda viwili, chumba binafsi cha mikutano, jiko kamili na sehemu ya kulia kwa malazi kamili kama nyumbani.",
    "A generous double bed-room ideal for families, with four beds, a private kitchen and dining area, and a balcony to enjoy the Mbeya views.":"Chumba kikubwa cha vitanda kinachofaa kwa familia, chenye vitanda vinne, jiko binafsi na sehemu ya kulia, pamoja na baraza la kufurahia mandhari ya Mbeya.",
    "A comfortable and affordable room with a single bed, a cozy sofa and a dressing table — everything you need for a restful stay.":"Chumba cha starehe na bei nafuu chenye kitanda kimoja, kochi la starehe na meza ya kujipamba — kila kitu unachohitaji kwa malazi ya raha.",
    "Our best-value room with a private veranda — a simple, comfortable single bedroom with all the essentials for a great night.":"Chumba chetu cha thamani bora chenye veranda binafsi — chumba rahisi cha starehe chenye kitanda kimoja na mahitaji yote muhimu kwa usiku mzuri.",
    "Premium comfort — a king-size bed, sofa, dressing table, fridge and TV for a relaxed stay.":"Starehe ya premium — kitanda cha ukubwa wa mfalme, kochi, meza ya kujipamba, friji na TV kwa malazi ya raha.",
    "Premium comfort with a king-size bed, comfortable sofa, dressing table, fridge and TV.":"Starehe ya premium yenye kitanda cha ukubwa wa mfalme, kochi la starehe, meza ya kujipamba, friji na TV.",
    "A well-appointed standard room with a single bed, comfortable sofa, dressing table, fridge and TV.":"Chumba cha kawaida kilichopangwa vizuri chenye kitanda kimoja, kochi la starehe, meza ya kujipamba, friji na TV.",
    "Our best-value room — a simple, comfortable single bedroom with fridge and TV.":"Chumba chetu cha thamani bora — chumba rahisi cha starehe chenye kitanda kimoja, friji na TV.",
    "A spacious double bed-room for families — four beds, private kitchen and dining, with a balcony overlooking Mbeya.":"Chumba kikubwa cha vitanda viili kwa familia — vitanda vinne, jiko binafsi na sehemu ya kulia, na baraza lenye mandhari ya Mbeya.",
    "A generous double bed-room ideal for families — four beds, private kitchen and dining, with a balcony to enjoy the Mbeya views.":"Chumba kikubwa cha vitanda viili kinachofaa kwa familia — vitanda vinne, jiko binafsi na sehemu ya kulia, na baraza la kufurahia mandhari ya Mbeya.",
    "Our finest suite — two beds, a private meeting room, full kitchen and dining for a complete home-away-from-home stay.":"Suite yetu bora — vitanda viwili, chumba binafsi cha mikutano, jiko kamili na sehemu ya kulia kwa malazi kamili kama nyumbani.",
    "A spacious double bed-room for families — four beds, a private kitchen and dining area, and a balcony with Mbeya views.":"Chumba kikubwa cha vitanda kwa familia — vitanda vinne, jiko binafsi na sehemu ya kulia, na baraza lenye mandhari ya Mbeya.",
    "Comfortable and affordable — a single bed, a cozy sofa and a dressing table for a restful stay.":"Starehe na bei nafuu — kitanda kimoja, kochi la starehe na meza ya kujipamba kwa malazi ya raha.",
    "Our best-value room with a private veranda — a simple, comfortable single bedroom with the essentials.":"Chumba chetu cha thamani bora chenye veranda binafsi — chumba rahisi cha starehe chenye mahitaji muhimu.",
    "Every room at Mbeya Forest Hill Motel includes complimentary Wi-Fi, free airport shuttle, free private parking, and access to our pool and sauna — comfort comes standard, every night.":"Kila chumba katika Mbeya Forest Hill Motel kinajumuisha Wi-Fi ya bure, usafiri wa bure wa uwanja wa ndege, maegesho binafsi ya bure, na matumizi ya bwawa na sauna — starehe ni kawaida, kila usiku.",
    /* --- home (index) --- */
    "Mbeya, Tanzania":"Mbeya, Tanzania","Your Comfort Retreat in the Heart of":"Mahali Pako pa Starehe Katikati ya",
    "Mbeya Hospitality At It's Best":"Ukarimu wa Mbeya kwa Kiwango Bora Zaidi",
    "Nestled in the lush hills of Mbeya, Forest Hill Motel offers air-conditioned rooms, an indoor pool, sauna, fitness centre, and a full buffet breakfast — just 1.9 km from Mbeya Airport.":"Iliyoko katika milima ya kijani ya Mbeya, Forest Hill Motel inatoa vyumba vyenye kiyoyozi, bwawa la ndani, sauna, kituo cha mazoezi, na kifungua kinywa kamili cha buffet — kwa umbali wa kilomita 1.9 tu kutoka Uwanja wa Ndege wa Mbeya.",
    "Explore Rooms":"Tazama Vyumba","Free Airport Shuttle · Free WiFi · Free Parking":"Usafiri wa Bure wa Uwanja wa Ndege · WiFi Bure · Maegesho Bure",
    "Scroll to explore":"Sogeza kuona zaidi","Check — In":"Kuingia","Check — Out":"Kutoka","Check Availability":"Angalia Upatikanaji",
    "01 Adult":"Mtu mzima 01","02 Adults":"Watu wazima 02","03 Adults":"Watu wazima 03","04 Adults":"Watu wazima 04",
    "0 Children":"Watoto 0","01 Child":"Mtoto 01","02 Children":"Watoto 02","03 Children":"Watoto 03",
    "1 Guest":"Mgeni 1","2 Guests":"Wageni 2","3 Guests":"Wageni 3","4 Guests":"Wageni 4",
    "Welcome to Forest Hill":"Karibu Forest Hill","Comfortable accommodations in the hills of Mbeya.":"Malazi ya starehe katika milima ya Mbeya.",
    "Mbeya Forest Hill Motel offers family rooms with air-conditioning, private bathrooms, and garden views. Every room includes a work desk, TV, and free WiFi — designed for both leisure travellers and business guests.":"Mbeya Forest Hill Motel inatoa vyumba vya familia vyenye kiyoyozi, bafu binafsi, na mandhari ya bustani. Kila chumba kina meza ya kazi, TV, na WiFi ya bure — vimeundwa kwa wasafiri wa mapumziko na wageni wa biashara.",
    "Enjoy our indoor swimming pool, sauna, fitness room, restaurant, bar, and evening entertainment. Free airport shuttle and private parking on site.":"Furahia bwawa letu la ndani la kuogelea, sauna, chumba cha mazoezi, mkahawa, baa, na burudani za jioni. Usafiri wa bure wa uwanja wa ndege na maegesho binafsi hapa hapa.",
    "Discover Our Story":"Gundua Hadithi Yetu","Accommodation":"Malazi","Rooms for every type of stay.":"Vyumba kwa kila aina ya malazi.",
    "Five room types to suit solo travellers, couples, and families — all with air-conditioning, private bathrooms, TV, and free WiFi.":"Aina tano za vyumba zinazofaa wasafiri wa peke yao, wapenzi, na familia — vyote vyenye kiyoyozi, bafu binafsi, TV, na WiFi ya bure.",
    "View All Our Rooms":"Tazama Vyumba Vyote","Beyond your room":"Zaidi ya chumba chako","Every facility you need, on site":"Kila huduma unayohitaji, hapa hapa",
    "Indoor Pool & Sauna":"Bwawa la Ndani & Sauna","Unwind in our heated indoor swimming pool or relax in the sauna after a long journey.":"Pumzika katika bwawa letu la ndani la maji ya moto au tulia katika sauna baada ya safari ndefu.",
    "Explore →":"Tazama →","Restaurant & Bar":"Mkahawa & Baa","Start the day with a full buffet breakfast — English, Irish, vegetarian and Asian options.":"Anza siku na kifungua kinywa kamili cha buffet — chaguo za Kiingereza, Kiayalandi, mboga, na Kiasia.",
    "Fitness Centre":"Kituo cha Mazoezi","Keep your routine going in our fully equipped fitness room, open every day.":"Endeleza ratiba yako katika chumba chetu cha mazoezi kilicho na vifaa kamili, kilicho wazi kila siku.",
    "Meetings & Events":"Mikutano & Matukio","Host your conference or private event in our dedicated meeting room with full AV support.":"Andaa mkutano au tukio lako binafsi katika chumba chetu maalum cha mikutano chenye msaada kamili wa AV.",
    "Dining on site":"Chakula hapa hapa","A full breakfast and a welcoming restaurant.":"Kifungua kinywa kamili na mkahawa wa kukaribisha.",
    "Begin every morning with our generous buffet — Full English, Irish, vegetarian, and Asian options included. In the evening, enjoy the on-site restaurant, lounge bar, and live entertainment.":"Anza kila asubuhi na buffet yetu tele — chaguo kamili za Kiingereza, Kiayalandi, mboga, na Kiasia zimejumuishwa. Jioni, furahia mkahawa, baa ya kupumzika, na burudani za moja kwa moja.",
    "Buffet Breakfast Included":"Kifungua kinywa cha Buffet Kimejumuishwa","Full English, Vegetarian & Asian Options":"Chaguo za Kiingereza, Mboga & Kiasia",
    "On-Site Restaurant & Lounge Bar":"Mkahawa & Baa ya Kupumzika Hapa Hapa","Evening Entertainment & Room Service":"Burudani za Jioni & Huduma ya Chumbani",
    "Explore Dining":"Tazama Chakula","Your comfort, our priority":"Starehe yako, kipaumbele chetu",
    "Air-conditioned rooms, garden views, and warm Tanzanian hospitality.":"Vyumba vyenye kiyoyozi, mandhari ya bustani, na ukarimu wa joto wa Kitanzania.",
    "Current Offers":"Ofa za Sasa","Specials & Packages":"Maalum & Vifurushi","Available Now":"Inapatikana Sasa",
    "Pool & Sauna access included with every room":"Bwawa & Sauna vimejumuishwa na kila chumba",
    "All guests enjoy unlimited access to our indoor swimming pool, sauna, and terrace throughout their stay.":"Wageni wote hufurahia matumizi yasiyo na kikomo ya bwawa letu la ndani, sauna, na roshani katika kipindi chote cha malazi yao.",
    "Book Now →":"Weka Sasa →","Family Offer":"Ofa ya Familia","Family Room with Balcony — up to 4 guests":"Chumba cha Familia chenye Baraza — hadi wageni 4",
    "Our family room with balcony sleeps up to 4 guests with four beds, a private kitchen and dining. Ideal for parents and children — all ages welcome at check-in.":"Chumba chetu cha familia chenye baraza hulala hadi wageni 4 katika vitanda vinne, chenye jiko binafsi na sehemu ya kulia. Kinafaa kwa wazazi na watoto — rika zote zinakaribishwa wakati wa kuingia.",
    "View Room →":"Tazama Chumba →","Daily Offer":"Ofa ya Kila Siku","Full buffet breakfast included in all bookings":"Kifungua kinywa kamili cha buffet kimejumuishwa katika hifadhi zote",
    "Start every morning right — Full English, Irish, vegetarian, and Asian options served fresh from our kitchen.":"Anza kila asubuhi vizuri — chaguo kamili za Kiingereza, Kiayalandi, mboga, na Kiasia zinazoandaliwa upya kutoka jiko letu.",
    "Reserve a Table →":"Weka Meza →","Guest stories":"Hadithi za Wageni","What our guests say":"Wageni wetu wanasema nini",
    "Good value and great location for Mbeya":"Thamani nzuri na eneo zuri kwa Mbeya",
    "The staff were very friendly and helpful. The pool was a pleasant surprise — clean and well-maintained. A solid choice for anyone visiting Mbeya.":"Wafanyakazi walikuwa wakarimu sana na wasaidizi. Bwawa lilikuwa furaha isiyotarajiwa — safi na lililotunzwa vizuri. Chaguo zuri kwa yeyote anayetembelea Mbeya.",
    "Airport shuttle was a lifesaver":"Usafiri wa uwanja wa ndege ulikuwa msaada mkubwa",
    "Arrived late and the free airport transfer made everything easy. Room had everything I needed — AC, WiFi, hot water. Breakfast was generous.":"Nilifika usiku na usafiri wa bure wa uwanja wa ndege ulirahisisha kila kitu. Chumba kilikuwa na kila nilichohitaji — kiyoyozi, WiFi, maji ya moto. Kifungua kinywa kilikuwa tele.",
    "Perfect for a family stopover":"Bora kwa mapumziko ya familia",
    "We stayed two nights with three kids. The family room was spacious and the children loved the playground area. Pets were also welcome, which helped us greatly.":"Tulikaa usiku mbili na watoto watatu. Chumba cha familia kilikuwa pana na watoto walipenda eneo la michezo. Wanyama vipenzi pia walikaribishwa, jambo lililotusaidia sana.",
    "Stay in touch":"Endelea kuwasiliana","Stay informed about our latest offers":"Pata taarifa za ofa zetu mpya",
    "Join our mailing list for special rates, seasonal packages, and news from Mbeya Forest Hill Motel.":"Jiunge na orodha yetu ya barua kwa bei maalum, vifurushi vya msimu, na habari kutoka Mbeya Forest Hill Motel.",
    "Subscribe":"Jiunge","Subscribed ✓":"Umejiunge ✓",
    /* --- about --- */
    "Comfort and convenience in the hills of Mbeya":"Starehe na urahisi katika milima ya Mbeya",
    "Located just 1.9 kilometres from Mbeya Airport, Mbeya Forest Hill Motel is your home away from home in Southern Tanzania — welcoming families, business travellers, and visitors alike.":"Iliyoko kwa umbali wa kilomita 1.9 tu kutoka Uwanja wa Ndege wa Mbeya, Mbeya Forest Hill Motel ni nyumba yako mbali na nyumbani Kusini mwa Tanzania — ikikaribisha familia, wasafiri wa biashara, na wageni wote.",
    "Children of All Ages Welcome":"Watoto wa Rika Zote Wanakaribishwa",
    "No age restriction at check-in. Children are warmly welcomed, and pets stay free — making Forest Hill a true home for the whole family.":"Hakuna kizuizi cha umri wakati wa kuingia. Watoto wanakaribishwa kwa joto, na wanyama vipenzi hukaa bure — kuifanya Forest Hill kuwa nyumba ya kweli kwa familia nzima.",
    "Full Room Amenities":"Huduma Kamili za Chumba",
    "Every room includes air-conditioning, private bathroom, work desk, TV, and free WiFi — with garden views and daily housekeeping as standard.":"Kila chumba kina kiyoyozi, bafu binafsi, meza ya kazi, TV, na WiFi ya bure — chenye mandhari ya bustani na usafi wa kila siku kama kawaida.",
    "Room types — from our Junior Bedroom to the VIP Suite.":"Aina za vyumba — kutoka Chumba Kidogo hadi Suite ya VIP.",
    "On-site facilities including pool, sauna, gym, restaurant, and bar.":"Huduma za hapa hapa zikiwemo bwawa, sauna, mazoezi, mkahawa, na baa.",
    "From Mbeya Airport — with our complimentary shuttle running daily.":"Kutoka Uwanja wa Ndege wa Mbeya — na usafiri wetu wa bure unaofanya kazi kila siku.",
    "Our story":"Hadithi yetu","A welcoming retreat in the heart of Southern Tanzania.":"Mahali pa kukaribisha katikati ya Kusini mwa Tanzania.",
    "Mbeya Forest Hill Motel was built to offer travellers in Mbeya a comfortable, well-equipped base — whether arriving for business, family visits, or to explore the stunning landscapes of Southern Tanzania's highlands.":"Mbeya Forest Hill Motel ilijengwa kuwapa wasafiri wa Mbeya makazi ya starehe yenye vifaa kamili — iwe wanafika kwa biashara, ziara za familia, au kuchunguza mandhari ya kuvutia ya milima ya Kusini mwa Tanzania.",
    "From our indoor pool and fitness centre to our buffet restaurant and free airport shuttle, every detail is designed to make your stay easy and enjoyable.":"Kuanzia bwawa letu la ndani na kituo cha mazoezi hadi mkahawa wa buffet na usafiri wa bure wa uwanja wa ndege, kila kipengele kimeundwa kufanya malazi yako rahisi na ya kufurahisha.",
    "Why choose us":"Kwa nini utuchague","Everything included — no hidden extras":"Kila kitu kimejumuishwa — hakuna gharama za siri",
    "At Forest Hill Motel, our most popular amenities come standard with every room booking — so you can relax without surprises at checkout.":"Katika Forest Hill Motel, huduma zetu maarufu zaidi huja kama kawaida na kila hifadhi ya chumba — ili upumzike bila mshangao wakati wa kuondoka.",
    "Buffet breakfast included":"Kifungua kinywa cha buffet kimejumuishwa","Free WiFi in all rooms":"WiFi ya bure katika vyumba vyote",
    "Indoor swimming pool":"Bwawa la ndani la kuogelea","Free private parking":"Maegesho binafsi ya bure","Pets welcome — no charge":"Wanyama vipenzi wanakaribishwa — bila malipo",
    "Read More":"Soma Zaidi","Read More →":"Soma Zaidi →","What we offer":"Tunachotoa","A house of many pleasures":"Nyumba ya raha nyingi",
    "On-site dining with full buffet breakfast and evening meals. Bar, lounge, and room service available.":"Chakula hapa hapa chenye kifungua kinywa kamili cha buffet na milo ya jioni. Baa, sehemu ya kupumzika, na huduma ya chumbani vinapatikana.",
    "Pool & Sauna":"Bwawa & Sauna","Indoor heated swimming pool open daily, complemented by a sauna and terrace for total relaxation.":"Bwawa la ndani la maji ya moto lililo wazi kila siku, likikamilishwa na sauna na roshani kwa mapumziko kamili.",
    "Dedicated conference room with AV support — ideal for business meetings, seminars, and private events.":"Chumba maalum cha mikutano chenye msaada wa AV — bora kwa mikutano ya biashara, semina, na matukio binafsi.",
    "In their words":"Kwa maneno yao","Great value for Mbeya":"Thamani nzuri kwa Mbeya",
    "Good value for the price. The pool was a nice bonus and the buffet breakfast was generous. Staff were friendly and helpful throughout.":"Thamani nzuri kwa bei. Bwawa lilikuwa nyongeza nzuri na kifungua kinywa cha buffet kilikuwa tele. Wafanyakazi walikuwa wakarimu na wasaidizi muda wote.",
    "Airport shuttle made arrival easy":"Usafiri wa uwanja wa ndege ulirahisisha kufika",
    "The free airport transfer was very convenient. Room had working AC, hot water, and WiFi — everything a business traveller needs.":"Usafiri wa bure wa uwanja wa ndege ulikuwa rahisi sana. Chumba kilikuwa na kiyoyozi kinachofanya kazi, maji ya moto, na WiFi — kila kitu ambacho msafiri wa biashara anahitaji.",
    "Ideal family stop in Mbeya":"Mahali bora pa familia Mbeya",
    "Brought three kids and a dog. The family room was roomy and pets were genuinely welcome at no extra charge. We appreciated the outdoor space.":"Nilileta watoto watatu na mbwa. Chumba cha familia kilikuwa pana na wanyama vipenzi walikaribishwa kwa kweli bila malipo ya ziada. Tulithamini eneo la nje.",
    "Reservations":"Hifadhi","How to find us?":"Jinsi ya kutupata?","Forest Hill Road, P.O. Box 2237, Mbeya, Tanzania — 1.9 km from Mbeya Airport.":"Forest Hill Road, Sanduku la Posta 2237, Mbeya, Tanzania — kilomita 1.9 kutoka Uwanja wa Ndege wa Mbeya.",
    "Book Room Today":"Weka Chumba Leo","Get In Touch":"Wasiliana Nasi",
    /* --- rooms list --- */
    "Rooms & Suites":"Vyumba & Suite","Search":"Tafuta","Filter":"Chuja","Max Price —":"Bei ya Juu —",
    "Minimum Capacity":"Uwezo wa Chini","Any":"Yoyote","2+ Guests":"Wageni 2+","4+ Guests":"Wageni 4+","6+ Guests":"Wageni 6+",
    "Popular Rooms":"Vyumba Maarufu","Need help booking?":"Unahitaji msaada kuhifadhi?",
    "Our reservations team is available daily to craft your perfect stay.":"Timu yetu ya hifadhi inapatikana kila siku kuandaa malazi yako kamili.",
    "Contact Us →":"Wasiliana Nasi →","Sort by":"Panga kwa","Recommended":"Inayopendekezwa","Price: Low to High":"Bei: Chini hadi Juu",
    "Price: High to Low":"Bei: Juu hadi Chini","Capacity: Largest":"Uwezo: Mkubwa","Book Room":"Weka Chumba",
    "No rooms match your filters. Try widening your search.":"Hakuna vyumba vinavyolingana na vichujio vyako. Jaribu kupanua utafutaji wako.",
    /* --- room detail --- */
    "You may also like":"Unaweza pia kupenda","Other rooms to explore":"Vyumba vingine vya kutazama","Reserve Now":"Weka Sasa",
    "You won't be charged yet · Free cancellation 24h":"Hutatozwa bado · Kughairi bure ndani ya saa 24",
    /* --- booking --- */
    "Reserve Your Stay":"Weka Malazi Yako","Stay":"Malazi","Room":"Chumba","Payment":"Malipo","Done":"Imekamilika",
    "When would you like to stay?":"Ungependa kukaa lini?","Select your arrival and departure dates and the number of guests.":"Chagua tarehe za kufika na kuondoka pamoja na idadi ya wageni.",
    "Adults":"Watu wazima","Children":"Watoto","Continue →":"Endelea →","Choose your room":"Chagua chumba chako",
    "Select the room that suits your stay. You can change this anytime.":"Chagua chumba kinachofaa malazi yako. Unaweza kubadilisha hili wakati wowote.",
    "← Back":"← Rudi","Guest details":"Taarifa za mgeni","Tell us who's staying so we can prepare everything for your arrival.":"Tuambie nani atakaa ili tuandae kila kitu kwa kuwasili kwako.",
    "First Name":"Jina la Kwanza","Last Name":"Jina la Mwisho","Phone":"Simu","Special Requests":"Maombi Maalum",
    "You won't be charged until check-in. Cancellation is free up to 24h before arrival.":"Hutatozwa hadi wakati wa kuingia. Kughairi ni bure hadi saa 24 kabla ya kuwasili.",
    "Cardholder Name":"Jina la Mwenye Kadi","Card Number":"Namba ya Kadi","Expiry":"Mwisho","Confirm Booking":"Thibitisha Hifadhi",
    "Your stay is confirmed":"Malazi yako yamethibitishwa","A confirmation has been sent to":"Uthibitisho umetumwa kwa",
    "Back to Home":"Rudi Mwanzo","Explore Experiences":"Tazama Huduma","Your Reservation":"Hifadhi Yako",
    "Check-in":"Kuingia","Check-out":"Kutoka","Service & taxes (incl.)":"Huduma & kodi (imejumuishwa)","Total":"Jumla",
    "Early check-in, dietary needs, celebration…":"Kuingia mapema, mahitaji ya chakula, sherehe…",
    /* --- contact --- */
    "We'd love to hear from you":"Tungependa kusikia kutoka kwako","Contact Us":"Wasiliana Nasi","Address":"Anuani",
    "Check-in / Check-out":"Kuingia / Kutoka","Check-out: by 11:00":"Kutoka: kabla ya 11:00","Send a message":"Tuma ujumbe",
    "Let's plan your stay together":"Tupange malazi yako pamoja",
    "Whether it's a reservation enquiry, an event, or a special request — our team will reply within one business day.":"Iwe ni swali la hifadhi, tukio, au ombi maalum — timu yetu itajibu ndani ya siku moja ya kazi.",
    "Reservation & Enquiries":"Hifadhi & Maswali","Full Name":"Jina Kamili","Subject":"Mada","Message":"Ujumbe",
    "Room Reservation":"Hifadhi ya Chumba","Airport Shuttle":"Usafiri wa Uwanja wa Ndege","Conference & Events":"Mikutano & Matukio",
    "Dining & Restaurant":"Chakula & Mkahawa","General Enquiry":"Maswali ya Jumla","Send Message":"Tuma Ujumbe",
    "Thank you — your message has been sent. We'll be in touch shortly.":"Asante — ujumbe wako umetumwa. Tutawasiliana nawe hivi karibuni.",
    "Prefer to book now?":"Ungependa kuhifadhi sasa?","Your stay in Mbeya is just a few clicks away":"Malazi yako Mbeya ni mibofyo michache tu",
    "Tell us how we can help…":"Tuambie tunavyoweza kukusaidia…",
    /* --- experiences --- */
    "Facilities & Experiences":"Huduma & Starehe","Everything You Need, On Site":"Kila Unachohitaji, Hapa Hapa",
    "From the indoor pool and sauna to the restaurant, fitness centre, and conference room — Mbeya Forest Hill Motel has all the facilities to make your stay complete.":"Kuanzia bwawa la ndani na sauna hadi mkahawa, kituo cha mazoezi, na chumba cha mikutano — Mbeya Forest Hill Motel ina huduma zote za kufanya malazi yako kuwa kamili.",
    "01 — Wellness":"01 — Afya","Relax and recharge at any time":"Pumzika na ujiongeze nguvu wakati wowote",
    "Dive into our heated indoor swimming pool or melt away the day's journey in the sauna. The pool and terrace area are available to all guests throughout their stay — no additional booking required.":"Ingia katika bwawa letu la ndani la maji ya moto au ondoa uchovu wa safari ya siku katika sauna. Bwawa na eneo la roshani vinapatikana kwa wageni wote katika kipindi chote cha malazi — hakuna hifadhi ya ziada inayohitajika.",
    "Indoor Heated Pool":"Bwawa la Ndani la Moto","Sauna":"Sauna","Terrace":"Roshani","Spa Bath":"Bafu la Spa","Book Your Stay →":"Weka Malazi Yako →",
    "02 — Active":"02 — Mazoezi","Keep your routine going in Mbeya":"Endeleza mazoezi yako Mbeya",
    "Our fully equipped fitness room features treadmills and exercise machines to keep you active during your stay. Open daily and included for all guests — no gym fees, no sign-up required.":"Chumba chetu cha mazoezi chenye vifaa kamili kina mashine za kukimbia na mashine za mazoezi kukufanya uendelee kuwa hai wakati wa malazi yako. Wazi kila siku na kimejumuishwa kwa wageni wote — hakuna ada za mazoezi, hakuna usajili unaohitajika.",
    "Treadmills":"Mashine za Kukimbia","Exercise Machines":"Mashine za Mazoezi","Daily Access":"Upatikanaji wa Kila Siku","Free for Guests":"Bure kwa Wageni","Reserve a Room →":"Weka Chumba →",
    "03 — Business":"03 — Biashara","A professional space in the heart of Mbeya":"Sehemu ya kitaalamu katikati ya Mbeya",
    "Our dedicated conference room is equipped for seminars, corporate meetings, training sessions, and private events. With a large table, comfortable seating, and full AV support — your business runs smoothly here.":"Chumba chetu maalum cha mikutano kimeandaliwa kwa semina, mikutano ya kampuni, vipindi vya mafunzo, na matukio binafsi. Chenye meza kubwa, viti vya starehe, na msaada kamili wa AV — biashara yako huendelea vizuri hapa.",
    "Conference Room":"Chumba cha Mikutano","AV Equipment":"Vifaa vya AV","Private Events":"Matukio Binafsi","Catering Available":"Huduma ya Chakula Inapatikana","Enquire Now →":"Uliza Sasa →",
    "04 — Dining":"04 — Chakula","A full buffet and a welcoming bar every day":"Buffet kamili na baa ya kukaribisha kila siku",
    "Every stay at Forest Hill begins with a generous buffet breakfast — Full English, Irish, vegetarian, and Asian options prepared fresh each morning. In the evenings, our restaurant and lounge bar offer a relaxed dining experience with room service also available.":"Kila malazi katika Forest Hill huanza na kifungua kinywa tele cha buffet — chaguo kamili za Kiingereza, Kiayalandi, mboga, na Kiasia zinazoandaliwa upya kila asubuhi. Jioni, mkahawa wetu na baa ya kupumzika hutoa hali ya kula yenye utulivu na huduma ya chumbani pia inapatikana.",
    "Make a Dining Enquiry":"Uliza Kuhusu Chakula","Ready to book":"Tayari kuhifadhi","All facilities included — book your room at Forest Hill today":"Huduma zote zimejumuishwa — weka chumba chako Forest Hill leo","Reserve Your Room":"Weka Chumba Chako",
    /* --- gallery --- */
    "Moments at Mbeya Forest Hill":"Nyakati Mbeya Forest Hill","All":"Zote","Wellness":"Afya","Resort & Views":"Mandhari & Resort","Filling Station & Parking":"Kituo cha Mafuta & Maegesho","Play & Fun":"Michezo & Burudani"
  };
  const I18N_ATTRS = ['placeholder','aria-label','title','alt'];
  let LANG = (function(){ try{ return localStorage.getItem('fh-lang')||'en'; }catch(e){ return 'en'; } })();

  function i18nSkip(el){ if(!el) return true; const n=el.nodeName; if(n==='SCRIPT'||n==='STYLE'||n==='NOSCRIPT') return true; if(el.closest&&(el.closest('svg')||el.closest('[data-no-i18n]'))) return true; return false; }
  function i18nText(node){
    if(i18nSkip(node.parentNode)) return;
    const raw=node.nodeValue; if(!raw||!raw.trim()) return;
    if(node.__en===undefined) node.__en=raw;
    if(LANG==='sw'){ const k=node.__en.trim(), tr=I18N_DICT[k]; node.nodeValue=(tr!=null)?node.__en.replace(k,tr):node.__en; }
    else node.nodeValue=node.__en;
  }
  function i18nAttrs(el){
    if(i18nSkip(el)) return;
    I18N_ATTRS.forEach(a=>{ if(!el.hasAttribute(a)) return; const sk='__en_'+a; if(el[sk]===undefined) el[sk]=el.getAttribute(a); const o=el[sk]; if(!o||!o.trim()) return; if(LANG==='sw'){ const tr=I18N_DICT[o.trim()]; el.setAttribute(a,tr!=null?o.replace(o.trim(),tr):o); } else el.setAttribute(a,o); });
  }
  function i18nWalk(root){
    if(!root) return;
    if(root.nodeType===3){ i18nText(root); return; }
    if(root.nodeType!==1) return;
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null);
    const list=[]; while(w.nextNode()) list.push(w.currentNode);
    list.forEach(i18nText);
    const sel='['+I18N_ATTRS.join('],[')+']';
    if(root.matches&&root.matches(sel)) i18nAttrs(root);
    if(root.querySelectorAll) root.querySelectorAll(sel).forEach(i18nAttrs);
  }
  function setLang(l){
    LANG=(l==='sw')?'sw':'en';
    try{ localStorage.setItem('fh-lang',LANG); }catch(e){}
    document.documentElement.lang=LANG;
    i18nWalk(document.body);
    try{ window.dispatchEvent(new Event('fh-hero-title-remeasure')); }catch(_){}
    document.querySelectorAll('[data-lang-btn]').forEach(b=> b.classList.toggle('on', b.dataset.langBtn===LANG));
  }
  function initI18n(){
    document.querySelectorAll('[data-lang-btn]').forEach(b=> b.addEventListener('click',e=>{ e.preventDefault(); setLang(b.dataset.langBtn); }));
    setLang(LANG);
    if('MutationObserver' in window){
      const obs=new MutationObserver(ms=>{ for(const m of ms){ if(m.addedNodes) m.addedNodes.forEach(n=>{ if(n.nodeType===1) i18nWalk(n); else if(n.nodeType===3) i18nText(n); }); } });
      obs.observe(document.body,{childList:true,subtree:true});
    }
  }
  window.FHI18N={ setLang, t:(k)=>(LANG==='sw'&&I18N_DICT[k])||k, get lang(){return LANG;} };

  const NAV = [
    { id:'home',        label:'Home',         href:'index.html' },
    { id:'rooms',       label:'Rooms',        href:'rooms.html' },
    { id:'experiences', label:'Experiences',  href:'experiences.html' },
    { id:'gallery',     label:'Gallery',      href:'gallery.html' },
    { id:'about',       label:'About',        href:'about.html' },
    { id:'contact',     label:'Contact',      href:'contact.html' },
  ];

  const ICON = {
    user:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
    fb:'<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H7v3h3v6h3v-6h3l1-3h-4v-2c0-.6.4-1 1-1z"/></svg>',
    ig:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
    tw:'<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22 5.9c-.7.3-1.5.5-2.3.6.8-.5 1.4-1.3 1.7-2.2-.8.5-1.7.8-2.6 1A4 4 0 0 0 12 9.1c0 .3 0 .6.1.9A11.4 11.4 0 0 1 3.8 4.6a4 4 0 0 0 1.2 5.3c-.6 0-1.2-.2-1.7-.5v.1a4 4 0 0 0 3.2 3.9c-.6.1-1.1.2-1.7.1a4 4 0 0 0 3.7 2.8A8 8 0 0 1 2 18.1a11.3 11.3 0 0 0 6.1 1.8c7.4 0 11.4-6.1 11.4-11.4v-.5c.8-.6 1.5-1.3 2-2.1z"/></svg>',
    ta:'<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><circle cx="7.5" cy="13" r="2"/><circle cx="16.5" cy="13" r="2"/><path d="M12 7c-3 0-5.6.7-7.5 1.8H2l1.3 1.6A4.4 4.4 0 0 0 7.5 18a4.4 4.4 0 0 0 4-2.5 4.4 4.4 0 0 0 4 2.5 4.4 4.4 0 0 0 4.2-7.6L21 8.8h-1.5C17.6 7.7 15 7 12 7z" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>',
  };

  /* ---------- HEADER ---------- */
  function buildHeader(){
    const links = NAV.map(n=>`<a class="nav-link ${n.id===active?'active':''}" href="${n.href}">${n.label}</a>`).join('');
    const drawerLinks = NAV.map(n=>`<a href="${n.href}">${n.label}</a>`).join('');
    /* Topbar is only shown on pages with a solid (non-transparent) header.
       On hero/transparent pages the fixed header must be either fully see-through
       (at top) or fully opaque (on scroll) — a dark topbar behind a transparent
       header creates an ambiguous "partial background" that we want to avoid. */
    const topbar = transparent ? '' : `
    <div class="topbar">
      <div class="wrap-wide">
        <div class="tb-group hide-sm">
          <a href="tel:${CONTACT.phoneTel}">Tel. ${CONTACT.phone}</a>
          <span class="tb-sep">·</span>
          <a href="mailto:${CONTACT.email}">${CONTACT.email}</a>
        </div>
        <div class="tb-group">
          <a href="#" data-open-auth="login">Login</a><span class="tb-sep">/</span><a href="#" data-open-auth="register">Register</a>
          <span class="tb-sep hide-sm">·</span>
          <span class="tb-lang hide-sm"><span class="lang-switch" data-no-i18n><button type="button" data-lang-btn="en">EN</button><span class="sep">/</span><button type="button" data-lang-btn="sw">SW</button></span></span>
        </div>
      </div>
    </div>`;
    return `
    ${topbar}
    <header class="site-header ${transparent?'is-transparent':''}">
      <div class="wrap-wide">
        <nav class="nav">
          <a class="brand" href="index.html">
            <span><span class="brand-mark">Forest Hill</span><span class="brand-sub">Motel &amp; Suites · Mbeya</span></span>
          </a>
          <div class="nav-links">${links}</div>
          <div class="nav-right">
            <div class="lang-switch" data-no-i18n><button type="button" data-lang-btn="en">EN</button><span class="sep">/</span><button type="button" data-lang-btn="sw">SW</button></div>
            <a class="nav-icon" href="#" data-open-auth="login" aria-label="Account">${ICON.user}</a>
            <a class="btn btn--accent hide-sm-btn" href="booking.html" style="padding:.95em 1.7em">Book Room</a>
            <button class="nav-burger" aria-label="Menu" data-burger><span></span><span></span><span></span></button>
          </div>
        </nav>
      </div>
    </header>
    <div class="drawer" data-drawer>
      <div class="drawer-scrim" data-drawer-close></div>
      <div class="drawer-panel">
        <button class="drawer-close" data-drawer-close aria-label="Close">×</button>
        ${drawerLinks}
        <a href="booking.html" style="color:var(--accent)">Book Your Stay</a>
        <div class="lang-switch drawer-lang" data-no-i18n><button type="button" data-lang-btn="en">EN</button><span class="sep">/</span><button type="button" data-lang-btn="sw">SW</button></div>
      </div>
    </div>`;
  }

  /* ---------- FOOTER ---------- */
  function buildFooter(){
    return `
    <footer class="site-footer">
      <div class="wrap-wide">
        <div class="footer-grid">
          <div class="footer-brand">
            <span class="brand-mark">Forest Hill</span>
            <p style="margin-top:1.2rem;max-width:34ch;line-height:1.6">Nestled in the hills of Mbeya, Tanzania — offering comfortable rooms, an indoor pool, restaurant, and warm Tanzanian hospitality just 1.9 km from Mbeya Airport.</p>
            <div class="footer-social">
              <a href="https://www.facebook.com/profile.php?id=61586840549038" target="_blank" rel="noopener noreferrer" aria-label="Facebook">${ICON.fb}</a>
              <a href="https://www.instagram.com/mbeyaforesthillmotel/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">${ICON.ig}</a>
              <!-- <a href="#" aria-label="Twitter">${ICON.tw}</a> -->
              <!-- <a href="#" aria-label="Tripadvisor">${ICON.ta}</a> -->
            </div>
          </div>
          <div class="footer-col">
            <h4>Explore</h4>
            <ul>
              <li><a href="index.html">Home</a></li>
              <li><a href="rooms.html">Our Rooms</a></li>
              <li><a href="experiences.html">Experiences</a></li>
              <li><a href="gallery.html">Gallery</a></li>
              <li><a href="about.html">About Us</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Contact</h4>
            <ul>
              <li>${CONTACT.addressHtml}</li>
              <li><a href="tel:${CONTACT.phoneTel}">${CONTACT.phone}</a></li>
              <li><a href="mailto:${CONTACT.email}">${CONTACT.email}</a></li>
              <li>Check-in: 10:00 — 23:00</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Mbeya Forest Hill Motel. All rights reserved.</span>
          <div style="display:flex;gap:1.6rem">
            <a href="#">Terms of Use</a><a href="#">Privacy Policy</a><a href="contact.html">Find Us</a>
          </div>
        </div>
      </div>
    </footer>`;
  }

  /* ---------- AUTH MODAL ---------- */
  function buildAuth(){
    return `
    <div class="auth-modal" data-auth>
      <div class="auth-scrim" data-auth-close></div>
      <div class="auth-card">
        <button class="auth-x" data-auth-close aria-label="Close">×</button>
        <div class="auth-pane" data-pane="login">
          <span class="eyebrow no-rule">Welcome back</span>
          <h3 class="display" style="font-size:2.2rem;margin:.4rem 0 .3rem">Login</h3>
          <p class="muted" style="font-size:.92rem;margin-bottom:1.6rem">Sign in to your hotel account.</p>
          <label class="fld"><span>Username</span><input type="text" placeholder="your username"></label>
          <label class="fld"><span>Password</span><input type="password" placeholder="••••••••"></label>
          <div class="auth-row"><label class="chk"><input type="checkbox"> Remember me</label><a href="#" class="muted" style="font-size:.82rem">Forgot password?</a></div>
          <button class="btn btn--accent btn--block" style="margin-top:.4rem">Login</button>
          <p class="auth-switch">Not registered yet? <a href="#" data-pane-to="register">Create an account</a></p>
        </div>
        <div class="auth-pane" data-pane="register" hidden>
          <span class="eyebrow no-rule">Become a member</span>
          <h3 class="display" style="font-size:2.2rem;margin:.4rem 0 .3rem">Register</h3>
          <p class="muted" style="font-size:.92rem;margin-bottom:1.6rem">Enjoy exclusive privileges &amp; member rates.</p>
          <label class="fld"><span>User Name</span><input type="text"></label>
          <label class="fld"><span>Email</span><input type="email"></label>
          <label class="fld"><span>Password</span><input type="password"></label>
          <button class="btn btn--accent btn--block" style="margin-top:.4rem">Register Account</button>
          <p class="auth-switch">Already have an account? <a href="#" data-pane-to="login">Login</a></p>
        </div>
      </div>
    </div>`;
  }

  /* ---------- MOUNT ---------- */
  function mount(){
    const h = document.querySelector('[data-site-header]');
    if(h) h.innerHTML = buildHeader();
    const f = document.querySelector('[data-site-footer]');
    if(f) f.innerHTML = buildFooter();
    document.body.insertAdjacentHTML('beforeend', buildAuth());

    const authEl = document.querySelector('[data-auth]');
    window.openAuth = (pane)=>{
      authEl.classList.add('open');
      document.querySelectorAll('[data-pane]').forEach(p=> p.hidden = (p.dataset.pane!==(pane||'login')) );
    };
    document.querySelectorAll('[data-auth-close]').forEach(b=> b.addEventListener('click', ()=> authEl.classList.remove('open')));
    document.querySelectorAll('[data-pane-to]').forEach(b=> b.addEventListener('click', e=>{ e.preventDefault(); window.openAuth(b.dataset.paneTo); }));

    // scroll state for transparent header — snaps immediately (no partial fade)
    const header = document.querySelector('.site-header');
    if(header && transparent){
      const THRESHOLD = 80; // px before "full background" kicks in
      const onScroll = ()=> header.classList.toggle('scrolled', window.scrollY > THRESHOLD);
      onScroll(); window.addEventListener('scroll', onScroll, {passive:true});
    }

    // drawer
    const drawer = document.querySelector('[data-drawer]');
    document.querySelectorAll('[data-burger]').forEach(b=> b.addEventListener('click', ()=> drawer.classList.add('open')));
    document.querySelectorAll('[data-drawer-close]').forEach(b=> b.addEventListener('click', ()=> drawer.classList.remove('open')));

    // auth modal triggers (defined per-page if present)
    document.querySelectorAll('[data-open-auth]').forEach(b=>{
      b.addEventListener('click', e=>{ e.preventDefault(); if(window.openAuth) window.openAuth(b.dataset.openAuth); });
    });

    initReveal(); initCounters(); initBookingDefaults(); initImageFallbacks(); buildTweakPanel(); initI18n(); initHeroTitleRotate();
  }

  /* ---------- hero title — swipe between headline & slogan ---------- */
  function initHeroTitleRotate(){
    const root = document.querySelector('[data-hero-title]');
    if(!root) return;
    const viewport = root.querySelector('.hero-title-viewport');
    const track = root.querySelector('[data-hero-title-track]');
    if(!viewport || !track) return;
    const slides = [...track.querySelectorAll('.hero-title-slide')];
    if(slides.length < 2) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const HOLD = 2000;
    const DUR = 720;
    const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
    let idx = 0;
    let timer = null;
    let heights = [];

    function measure(){
      let max = 0;
      slides.forEach(s=>{
        s.style.height = 'auto';
        max = Math.max(max, s.getBoundingClientRect().height);
      });
      heights = slides.map(()=> max);
      slides.forEach(s=>{ s.style.height = max + 'px'; });
      viewport.style.height = max + 'px';
      track.style.height = (max * slides.length) + 'px';
      track.style.transform = `translate3d(0,${-idx * max}px,0)`;
    }

    function go(next){
      idx = next;
      const y = -idx * heights[0];
      if(reduced){
        track.style.transition = 'none';
        track.style.transform = `translate3d(0,${y}px,0)`;
        return;
      }
      track.style.transition = `transform ${DUR}ms ${EASE}`;
      track.style.transform = `translate3d(0,${y}px,0)`;
    }

    function tick(){
      go((idx + 1) % slides.length);
      timer = setTimeout(tick, HOLD + DUR);
    }

    measure();
    window.addEventListener('resize', measure, {passive:true});
    window.addEventListener('fh-hero-title-remeasure', measure);
    timer = setTimeout(tick, HOLD);

    root.addEventListener('mouseenter', ()=>{ if(timer){ clearTimeout(timer); timer = null; } });
    root.addEventListener('mouseleave', ()=>{
      if(!timer) timer = setTimeout(tick, HOLD);
    });
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal(){
    const els = document.querySelectorAll('[data-reveal]');
    if(!('IntersectionObserver' in window)){ els.forEach(e=>e.classList.add('in')); return; }
    const io = new IntersectionObserver((ents)=>{
      ents.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    },{ threshold:.12, rootMargin:'0px 0px -8% 0px' });
    els.forEach((e,i)=>{ e.style.transitionDelay = (Math.min(i%4,3)*70)+'ms'; io.observe(e); });
  }

  /* ---------- animated counters ---------- */
  function initCounters(){
    const nums = document.querySelectorAll('[data-count]');
    if(!nums.length) return;
    const io = new IntersectionObserver((ents)=>{
      ents.forEach(en=>{
        if(!en.isIntersecting) return;
        const el = en.target, target = +el.dataset.count, suffix = el.dataset.suffix||'';
        let t0=null, dur=1600;
        const step=(t)=>{ if(!t0)t0=t; const p=Math.min((t-t0)/dur,1); const e=1-Math.pow(1-p,3);
          el.textContent = Math.round(e*target)+suffix; if(p<1) requestAnimationFrame(step); };
        requestAnimationFrame(step); io.unobserve(el);
      });
    },{ threshold:.5 });
    nums.forEach(n=>io.observe(n));
  }

  /* ---------- external image fallbacks ----------
     Every photo loaded from a remote host (Booking.com cf.bstatic.com and
     the 7iquid demo CDN) has a local copy stored in assets/images/external/.
     The remote URL stays the primary source; if it ever fails to load
     (taken down, host offline, blocked), we silently swap in the local copy.
     Matching is by filename, so query strings on the remote URL don't matter. */
  function initImageFallbacks(){
    const LOCAL_DIR = 'assets/images/external/';
    const FALLBACKS = {
      'h4-img6.webp':'h4-img6.webp',
      'h4-img7.webp':'h4-img7.webp',
      'h4-img8.webp':'h4-img8.webp',
      'standard-room-1.jpg':'standard-room-1.jpg',
      'img1-ab-h1.webp':'img1-ab-h1.webp',
      'visa_inc_logo.svg':'visa_inc_logo.svg',
      'mastercard-logo.svg':'mastercard-logo.svg',
      'americanexpresslogo.svg':'americanexpresslogo.svg',
      'paypal_logo.svg':'paypal_logo.svg',
      '743884551.jpg':'743884551.jpg',
      '743884568.jpg':'743884568.jpg',
      '743996654.jpg':'743996654.jpg',
      '743884562.jpg':'743884562.jpg',
      '744378060.jpg':'744378060.jpg',
      '743884475.jpg':'743884475.jpg',
    };
    function localFor(src){
      if(!src) return null;
      const clean = src.split('?')[0].split('#')[0];
      if(clean.indexOf(LOCAL_DIR) !== -1) return null; // already local — avoid loops
      const name = clean.substring(clean.lastIndexOf('/')+1);
      return FALLBACKS[name] ? LOCAL_DIR + FALLBACKS[name] : null;
    }
    function swap(img){ const l = localFor(img.getAttribute('src')); if(l) img.src = l; }
    // catch any future load failures (capture phase — error events don't bubble)
    document.addEventListener('error', e=>{ const t=e.target; if(t && t.tagName==='IMG') swap(t); }, true);
    // handle images that already errored before this script ran, and wire the rest
    document.querySelectorAll('img').forEach(img=>{
      if(img.complete && img.naturalWidth===0 && img.getAttribute('src')) swap(img);
      else img.addEventListener('error', ()=>swap(img), {once:true});
    });
  }

  /* ---------- booking widget defaults ---------- */
  function initBookingDefaults(){
    const fmt = d => d.toLocaleDateString('en-US',{day:'2-digit',month:'short',year:'numeric'});
    const today = new Date(); const tmr = new Date(Date.now()+864e5);
    document.querySelectorAll('[data-checkin]').forEach(el=>{ if(el.tagName==='INPUT'){ el.value=fmt(today);} });
    document.querySelectorAll('[data-checkout]').forEach(el=>{ if(el.tagName==='INPUT'){ el.value=fmt(tmr);} });
    // booking submit -> go to booking page carrying params
    document.querySelectorAll('[data-booking-form]').forEach(form=>{
      form.addEventListener('submit', e=>{ e.preventDefault(); window.location.href='booking.html'; });
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
