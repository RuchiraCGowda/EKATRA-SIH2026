import { AppLanguage, Lot } from '../../types/database';
import { EkatraDB } from '../supabase';
import { getMaterialCategoryName } from '../materialHelpers';
import { ChannelMessage, ChannelSession, ChannelResponse } from './channelTypes';
import { identifyScrapMaterial } from '../aiMaterialIdentification';
import { formatWhatsAppMetallurgyReport, getMetallurgyForCategory } from '../metallurgicalComposition';

/**
 * EKATRA UNIFIED CHANNEL SERVICE
 * Connects WhatsApp, SMS, and Mobile App to the exact same EkatraDB backend.
 * Shared data integrity: Creating a lot via WhatsApp or SMS writes directly
 * to EkatraDB, making it immediately visible in the Collector App.
 */
export class ChannelService {
  private static sessions: Map<string, ChannelSession> = new Map();

  public static getOrCreateSession(
    channelKey: string,
    channel: 'whatsapp' | 'sms',
    lang: AppLanguage = 'mr',
    userPhone: string = '+91 98201 54890'
  ): ChannelSession {
    if (!this.sessions.has(channelKey)) {
      this.sessions.set(channelKey, {
        channel,
        userPhone,
        lang,
        currentStep: 'idle',
      });
    }
    const session = this.sessions.get(channelKey)!;
    session.lang = lang;
    return session;
  }

  public static resetSession(channelKey: string): void {
    const session = this.sessions.get(channelKey);
    if (session) {
      session.currentStep = 'idle';
      session.draftLot = undefined;
    }
  }

  /**
   * Process WhatsApp Scrap Photo Upload & AI Metallurgical Identification
   */
  public static async processWhatsAppImageMessage(
    sessionKey: string,
    imageUrl: string,
    lang: AppLanguage = 'mr'
  ): Promise<ChannelResponse> {
    const session = this.getOrCreateSession(sessionKey, 'whatsapp', lang);
    const categories = EkatraDB.getCategories();

    // AI Computer Vision Recognition on photo
    const aiResult = await identifyScrapMaterial(imageUrl, categories, lang);
    const cat = aiResult.matchedCategory;
    const catName = getMaterialCategoryName(cat, lang);
    const metallurgy = aiResult.metallurgy;

    session.draftLot = {
      categoryId: cat.id,
      categoryCode: cat.code,
      imageUrl,
    };
    session.currentStep = 'awaiting_weight';

    const promptWeight =
      lang === 'mr'
        ? `\n\n⚖️ *या ई-कचऱ्याचे अंदाजे वजन (किलोमध्ये) किती आहे?*\nसंख्या टाईप करा (उदा. 15 किंवा 25.5) किंवा खालीलपैकी निवडा:`
        : lang === 'hi'
        ? `\n\n⚖️ *इस ई-कचरे का अनुमानित वजन (किलो) कितना है?*\nसंख्या लिखें (उदा. 15 या 25.5) या नीचे से चुनें:`
        : `\n\n⚖️ *What is the approximate weight in kg for this lot?*\nType a number (e.g. 15 or 25.5) or pick below:`;

    const text = formatWhatsAppMetallurgyReport(metallurgy, 10, lang) + promptWeight;

    return {
      channel: 'whatsapp',
      text,
      options: ['10', '25', '50', '100'],
      imageUrl,
      metallurgy,
    };
  }

  /**
   * Process WhatsApp Conversational Message
   */
  public static async processWhatsAppMessage(
    sessionKey: string,
    inputText: string,
    lang: AppLanguage = 'mr'
  ): Promise<ChannelResponse> {
    const session = this.getOrCreateSession(sessionKey, 'whatsapp', lang);
    const clean = inputText.trim();
    const lower = clean.toLowerCase();

    // Reset / Menu commands
    if (['hi', 'hello', 'namaste', 'menu', 'start', 'help', 'मदत', 'नमस्ते', 'హలో', 'வணக்கம்'].includes(lower)) {
      session.currentStep = 'idle';
      session.draftLot = undefined;
      return this.getWhatsAppMenu(lang);
    }

    // Photo prompt or scan command
    if (
      lower.includes('photo') ||
      lower.includes('camera') ||
      lower.includes('scan') ||
      lower.includes('फोटो') ||
      lower.includes('कॅमेरा') ||
      lower.includes('चित्र')
    ) {
      const promptPhoto =
        lang === 'mr'
          ? `📸 *ई-कचऱ्याचा फोटो काढा किंवा गॅलरीतून निवडा!*\n\nखालील बटणांचा वापर करा:\n1. 📷 *कॅमेरा बटण* - थेट फोटो काढण्यासाठी\n2. 📁 *गॅलरी बटण* - फोनमधील फोटो जोडण्यासाठी\n\nकिंवा प्रात्यक्षिक नमुना तपासण्यासाठी खालीलपैकी एकावर क्लिक करा:`
          : lang === 'hi'
          ? `📸 *ई-कचरे का फोटो खींचें या गैलरी से चुनें!*\n\nनीचे दिए गए बटनों का उपयोग करें:\n1. 📷 *कैमरा बटन* - लाइव फोटो लेने के लिए\n2. 📁 *गैलरी बटन* - फोन से फोटो जोड़ने के लिए\n\nया डेमो नमूने के लिए नीचे से चुनें:`
          : `📸 *Take a Live Photo or Upload an E-Waste Photo!*\n\nUse the buttons below:\n1. 📷 *Camera Button* - to snap a live photo\n2. 📁 *Gallery Button* - to upload an image\n\nOr click a sample scrap below for instant AI metal % scan:`;

      return {
        channel: 'whatsapp',
        text: promptPhoto,
        options: ['Motherboard PCB', 'Copper Cable', 'Inverter Battery', 'CRT Monitor'],
      };
    }

    // Step-by-step lot creation in WhatsApp
    if (session.currentStep === 'awaiting_category') {
      const categories = EkatraDB.getCategories();
      const num = parseInt(clean, 10);
      let selectedCat = categories[num - 1];

      if (!selectedCat) {
        selectedCat = categories.find(
          (c) =>
            c.code.toLowerCase() === lower ||
            c.name_en.toLowerCase().includes(lower) ||
            (c.name_hi && c.name_hi.includes(clean)) ||
            (c.name_mr && c.name_mr.includes(clean))
        ) || categories[0];
      }

      session.draftLot = {
        categoryId: selectedCat.id,
        categoryCode: selectedCat.code,
      };
      session.currentStep = 'awaiting_weight';

      const catName = getMaterialCategoryName(selectedCat, lang);
      const text =
        lang === 'mr'
          ? `✅ तुम्ही निवडले: *${catName}* (सरकारी दर: ₹${selectedCat.benchmark_price_per_kg}/किलो).\n\n⚖️ अंदाजे किती वजन (किलोमध्ये) आहे? कृपया संख्या टाईप करा (उदा. 15 किंवा 25.5):`
          : lang === 'hi'
          ? `✅ आपने चुना: *${catName}* (सरकारी भाव: ₹${selectedCat.benchmark_price_per_kg}/किलो)।\n\n⚖️ लगभग कितना वजन (किलो) है? संख्या लिखें (उदा. 15 या 25.5):`
          : `✅ Selected: *${catName}* (Benchmark: ₹${selectedCat.benchmark_price_per_kg}/kg).\n\n⚖️ What is the approximate weight in kg? Type a number (e.g., 15 or 25.5):`;

      return {
        channel: 'whatsapp',
        text,
        options: ['10', '25', '50', '100'],
      };
    }

    if (session.currentStep === 'awaiting_weight') {
      const weight = parseFloat(clean);
      if (isNaN(weight) || weight <= 0) {
        const errorText =
          lang === 'mr'
            ? '⚠️ कृपया वैध वजन किलोमध्ये टाईप करा (उदा. 20):'
            : lang === 'hi'
            ? '⚠️ कृपया सही वजन किलो में लिखें (उदा. 20):'
            : '⚠️ Please enter a valid positive weight in kg (e.g., 20):';
        return { channel: 'whatsapp', text: errorText };
      }

      if (!session.draftLot) session.draftLot = {};
      session.draftLot.weightKg = weight;
      session.currentStep = 'awaiting_location';

      const locText =
        lang === 'mr'
          ? `📍 माल उचलण्याचे ठिकाण (पिकअप एरिया) काय आहे? टाईप करा किंवा खालीलपैकी निवडा:`
          : lang === 'hi'
          ? `📍 माल उठाने का स्थान (पिकअप एरिया) क्या है? लिखें या नीचे से चुनें:`
          : `📍 What is your scrap pickup location/hub? Type or choose below:`;

      return {
        channel: 'whatsapp',
        text: locText,
        options: ['Dharavi Sector 4, Mumbai', 'Kurla West Yard', 'Sion Koliwada'],
      };
    }

    if (session.currentStep === 'awaiting_location') {
      const location = clean.length > 2 ? clean : 'Dharavi Scrap Yard, Mumbai';
      const draft = session.draftLot || {};
      const cat = EkatraDB.getCategories().find((c) => c.id === draft.categoryId) || EkatraDB.getCategories()[0];
      const weight = draft.weightKg || 15;

      // Automatically select optimal recycler
      const recyclers = EkatraDB.getRecyclers();
      const bestRecycler = recyclers.find((r) => r.pickup_available && r.authorization_status === 'verified') || recyclers[0];

      // WRITE DIRECTLY TO SHARED EKATRA BACKEND
      const createdLot = EkatraDB.createLot(
        cat.id,
        weight,
        location,
        19.0435,
        72.8567,
        draft.imageUrl || cat.image_url,
        `WhatsApp Channel collection: ${cat.name_en}`,
        bestRecycler?.id
      );

      session.currentStep = 'idle';
      session.draftLot = undefined;

      const rate = cat.benchmark_price_per_kg;
      const totalEstimated = Math.round(weight * rate);
      const catName = getMaterialCategoryName(cat, lang);

      const confirmText =
        lang === 'mr'
          ? `🎉 *ई-कचरा लॉट यशस्वीपणे नोंदवला गेला!*\n\n` +
            `📦 *लॉट कोड:* \`${createdLot.lot_code}\`\n` +
            `🔹 *वस्तू:* ${catName}\n` +
            `⚖️ *वजन:* ${weight} किलो\n` +
            `💰 *अंदाजे रक्कम:* ₹${totalEstimated.toLocaleString()} (₹${rate}/किलो)\n` +
            `🏢 *नियुक्त रिसायकलर:* ${bestRecycler.company_name}\n` +
            `📍 *पिकअप:* ${location}\n` +
            `🔐 *हस्तांतरण OTP:* \`${createdLot.handover_otp}\`\n\n` +
            `📲 *टीप:* हा लॉट आता तुमच्या *EKATRA Mobile App* मध्ये "माझी लॉट्स" (My Lots) मध्ये देखील त्वरित दिसेल!`
          : lang === 'hi'
          ? `🎉 *ई-कचरा लॉट सफलतापूर्वक दर्ज हुआ!*\n\n` +
            `📦 *लॉट कोड:* \`${createdLot.lot_code}\`\n` +
            `🔹 *सामग्री:* ${catName}\n` +
            `⚖️ *वजन:* ${weight} किलो\n` +
            `💰 *अनुमानित राशि:* ₹${totalEstimated.toLocaleString()} (₹${rate}/किलो)\n` +
            `🏢 *अधिकृत रीसाइक्लर:* ${bestRecycler.company_name}\n` +
            `📍 *स्थान:* ${location}\n` +
            `🔐 *हैंडओवर OTP:* \`${createdLot.handover_otp}\`\n\n` +
            `📲 *नोट:* यह लॉट आपके *EKATRA मोबाइल ऐप* के "माई लॉट्स" में तुरंत दिखाई देगा!`
          : `🎉 *E-Waste Lot Created Successfully!*\n\n` +
            `📦 *Lot Code:* \`${createdLot.lot_code}\`\n` +
            `🔹 *Material:* ${catName}\n` +
            `⚖️ *Weight:* ${weight} kg\n` +
            `💰 *Est. Payout:* ₹${totalEstimated.toLocaleString()} (₹${rate}/kg)\n` +
            `🏢 *Assigned Recycler:* ${bestRecycler.company_name}\n` +
            `📍 *Pickup:* ${location}\n` +
            `🔐 *Handover OTP:* \`${createdLot.handover_otp}\`\n\n` +
            `📲 *Note:* This lot is now instantly synced to your *EKATRA Mobile App* under "My Lots"!`;

      return {
        channel: 'whatsapp',
        text: confirmText,
        createdLot,
        options: ['Check My Lots', 'Check Price', 'Sell More E-Waste'],
      };
    }

    // Direct Menu Commands
    if (clean === '1' || lower.includes('sell') || lower.includes('विक') || lower.includes('बेच')) {
      session.currentStep = 'awaiting_category';
      const categories = EkatraDB.getCategories();
      let list =
        lang === 'mr'
          ? `📦 *कोणता ई-कचरा विकायचा आहे? नंबर निवडा:*\n\n`
          : lang === 'hi'
          ? `📦 *कौन सा ई-कचरा बेचना चाहते हैं? नंबर चुनें:*\n\n`
          : `📦 *Which e-waste material do you want to sell? Choose a number:*\n\n`;

      categories.forEach((c, idx) => {
        const name = getMaterialCategoryName(c, lang);
        list += `${idx + 1}. *${name}* — ₹${c.benchmark_price_per_kg}/kg\n`;
      });
      list += `\n${lang === 'mr' ? 'उदा. १ टाईप करा' : lang === 'hi' ? 'उदा. 1 टाइप करें' : 'e.g. Reply with 1'}`;

      return {
        channel: 'whatsapp',
        text: list,
        options: ['1', '2', '3', '4'],
      };
    }

    if (clean === '2' || lower.includes('price') || lower.includes('भाव') || lower.includes('रेट') || lower.includes('दर')) {
      const prices = EkatraDB.getPrices();
      let list =
        lang === 'mr'
          ? `💰 *आजचे शासकीय प्रमाणित खरेदी दर (CPCB/MPCB Benchmark):*\n\n`
          : lang === 'hi'
          ? `💰 *आज के सरकारी प्रमाणित खरीद भाव (CPCB/MPCB Benchmark):*\n\n`
          : `💰 *Today's Official Verified Purchase Rates (CPCB/MPCB Benchmark):*\n\n`;

      prices.forEach((p) => {
        const mat = getMaterialCategoryName(p.category, lang);
        list += `🔹 *${mat}*: ₹${p.buying_price_per_kg}/kg (Range: ₹${p.market_min_price}-₹${p.market_max_price})\n`;
      });
      list += `\n${lang === 'mr' ? 'माल विकण्यासाठी "1" टाईप करा.' : lang === 'hi' ? 'माल बेचने के लिए "1" टाइप करें।' : 'Reply "1" to sell your scrap.'}`;

      return {
        channel: 'whatsapp',
        text: list,
        options: ['1️⃣ Sell E-Waste', '3️⃣ My Lots', '4️⃣ My Earnings'],
      };
    }

    if (clean === '3' || lower.includes('lot') || lower.includes('लॉट')) {
      const lots = EkatraDB.getLots();
      if (lots.length === 0) {
        return {
          channel: 'whatsapp',
          text: lang === 'mr' ? 'सध्या कोणतेही लॉट नोंदवलेले नाही.' : 'No active lots found.',
          options: ['Sell E-Waste', 'Check Price'],
        };
      }

      let text =
        lang === 'mr'
          ? `📦 *तुमची सक्रिय लॉट्स (${lots.length}):*\n\n`
          : lang === 'hi'
          ? `📦 *आपके सक्रिय लॉट्स (${lots.length}):*\n\n`
          : `📦 *Your Active Lots (${lots.length}):*\n\n`;

      lots.slice(0, 3).forEach((l) => {
        const cat = getMaterialCategoryName(l.category, lang);
        text += `• *${l.lot_code}*: ${cat} (${l.approx_weight_kg} kg)\n   Status: *${l.status}* | OTP: \`${l.handover_otp}\`\n\n`;
      });

      return {
        channel: 'whatsapp',
        text,
        referencedLots: lots,
        options: ['Sell E-Waste', 'Check Price', 'My Earnings'],
      };
    }

    if (clean === '4' || lower.includes('earning') || lower.includes('कमाई') || lower.includes('पैसे')) {
      const payments = EkatraDB.getPayments();
      const total = payments.reduce((acc, p) => acc + p.amount_inr, 0);

      const text =
        lang === 'mr'
          ? `💵 *तुमची एकूण कमाई (EKATRA):*\n\n` +
            `• पूर्ण झालेले व्यवहार: *${payments.length}*\n` +
            `• जमा झालेली रक्कम: *₹${total.toLocaleString()}*\n` +
            `• सुरक्षित थेट हस्तांतरण: *100%*\n\n` +
            `सर्व व्यवहार सरकारी ऑडिट व नियमांचे पालन करून पूर्ण झाले आहेत.`
          : lang === 'hi'
          ? `💵 *आपकी कुल कमाई (EKATRA):*\n\n` +
            `• कुल पूरे हुए भुगतान: *${payments.length}*\n` +
            `• कुल प्राप्त राशि: *₹${total.toLocaleString()}*\n` +
            `• सुरक्षित सीधा भुगतान: *100%*`
          : `💵 *Your Total EKATRA Earnings:*\n\n` +
            `• Completed Payouts: *${payments.length}*\n` +
            `• Total Amount Settled: *₹${total.toLocaleString()}*\n` +
            `• Fair Weight Guarantee: *100%*`;

      return {
        channel: 'whatsapp',
        text,
        options: ['1️⃣ Sell E-Waste', '2️⃣ Check Price', '3️⃣ My Lots'],
      };
    }

    // Default fallback
    return this.getWhatsAppMenu(lang);
  }

  private static getWhatsAppMenu(lang: AppLanguage): ChannelResponse {
    const text =
      lang === 'mr'
        ? `👋 *नमस्ते! एकत्र (EKATRA) व्हॉट्सॲप सेवेमध्ये आपले स्वागत आहे.*\n\n` +
          `📸 *ई-कचऱ्याचा फोटो काढा किंवा जोडा:* AI तंत्रज्ञान थेट तुमच्या फोटोमधील मौल्यवान धातूंचे (सोने, चांदी, तांबे) अचूक टक्केवारी प्रमाण ओळखेल!\n\n` +
          `किंवा सेवा निवडण्यासाठी नंबर निवडा:\n` +
          `1️⃣ *ई-कचरा विका* (Sell E-Waste)\n` +
          `2️⃣ *आजचे शासकीय भाव पहा* (Check Price)\n` +
          `3️⃣ *माझी लॉट्स पहा* (My Lots)\n` +
          `4️⃣ *माझी कमाई* (My Earnings)\n` +
          `5️⃣ *मदत व सुरक्षितता* (Help)`
        : lang === 'hi'
        ? `👋 *नमस्ते! एकत्र (EKATRA) व्हाट्सएप सेवा में आपका स्वागत है।*\n\n` +
          `📸 *ई-कचरे का फोटो लें या अपलोड करें:* AI विजन तुरंत आपके फोटो में मौजूद धातुओं (सोना, चांदी, तांबा) का सटीक प्रतिशत पहचानेगा!\n\n` +
          `या सेवा के लिए नंबर चुनें:\n` +
          `1️⃣ *ई-कचरा बेचें* (Sell E-Waste)\n` +
          `2️⃣ *आज के सरकारी भाव* (Check Price)\n` +
          `3️⃣ *मेरे लॉट्स* (My Lots)\n` +
          `4️⃣ *मेरी कमाई* (My Earnings)\n` +
          `5️⃣ *मदद और सुरक्षा* (Help)`
        : `👋 *Welcome to EKATRA WhatsApp Digital Bridge!*\n\n` +
          `📸 *Snap or Upload an E-Waste Photo:* Our AI Computer Vision will immediately recognize the material and show the exact percentage of metals & mines (Gold, Silver, Copper, Rare Earths) present in it!\n\n` +
          `Or reply with a number below:\n` +
          `1️⃣ *Sell E-Waste* (Register scrap)\n` +
          `2️⃣ *Check Today's Price* (CPCB/MPCB rates)\n` +
          `3️⃣ *My Lots* (Track submissions)\n` +
          `4️⃣ *My Earnings* (Settlement ledger)\n` +
          `5️⃣ *Safety & Help*`;

    return {
      channel: 'whatsapp',
      text,
      options: ['📸 AI Photo Scan', '1️⃣ Sell E-Waste', '2️⃣ Check Price', '3️⃣ My Lots'],
    };
  }

  /**
   * Process SMS Text Command
   * Handles short text commands like:
   * - PRICE PCB
   * - STATUS LOT-7821
   * - MY LOTS
   * - HELP
   */
  public static async processSMSMessage(
    inputText: string,
    lang: AppLanguage = 'en'
  ): Promise<ChannelResponse> {
    const raw = inputText.trim();
    const upper = raw.toUpperCase();
    const parts = upper.split(/\s+/);
    const command = parts[0];
    const arg = parts.slice(1).join(' ');

    // 1. PRICE COMMAND (e.g. "PRICE PCB" or "PRICE")
    if (command === 'PRICE' || command === 'RATE' || command === 'BHAV' || command === 'भाव') {
      const prices = EkatraDB.getPrices();
      if (arg) {
        const match = prices.find(
          (p) =>
            p.category?.code.toUpperCase() === arg ||
            p.sub_category_name.toUpperCase().includes(arg) ||
            p.category?.name_en.toUpperCase().includes(arg)
        );

        if (match) {
          const mat = getMaterialCategoryName(match.category, lang);
          const text =
            `EKATRA Demo:\n` +
            `${mat} verified rate: Rs ${match.buying_price_per_kg}/kg.\n` +
            `Govt Benchmark: Rs ${match.market_min_price}-${match.market_max_price}/kg.\n` +
            `Dial/App to sell.`;
          return { channel: 'sms', text, referencedPrice: match };
        }
      }

      // Summary of top 3
      const top3 = prices.slice(0, 3);
      const ratesStr = top3
        .map((p) => `${p.category?.code}: Rs ${p.buying_price_per_kg}/kg`)
        .join(', ');
      const text = `EKATRA Demo Today Rates:\n${ratesStr}.\nReply PRICE <CODE> for details or SELL <CODE> <KG>.`;
      return { channel: 'sms', text };
    }

    // 2. STATUS COMMAND (e.g. "STATUS LOT-7821" or "STATUS")
    if (command === 'STATUS' || command === 'TRACK' || command === 'स्थिती') {
      const lots = EkatraDB.getLots();
      if (!arg) {
        const latest = lots[0];
        if (!latest) {
          return { channel: 'sms', text: 'EKATRA Demo: No active lots found. Reply SELL to register.' };
        }
        const text = `EKATRA Demo:\nLot ${latest.lot_code}: Status=${latest.status.toUpperCase()}, Wt=${latest.approx_weight_kg}kg, OTP=${latest.handover_otp}.`;
        return { channel: 'sms', text, createdLot: latest };
      }

      // Find by lot_code
      const lot = lots.find(
        (l) => l.lot_code.toUpperCase() === arg || l.lot_code.toUpperCase().replace('-', '') === arg.replace('-', '')
      );

      if (lot) {
        const cat = getMaterialCategoryName(lot.category, lang);
        const text =
          `EKATRA Demo:\n` +
          `Lot ${lot.lot_code} (${cat}):\n` +
          `Status: ${lot.status.toUpperCase()}\n` +
          `Verified Wt: ${lot.approx_weight_kg} kg\n` +
          `Handover OTP: ${lot.handover_otp}\n` +
          `Sync: App & SMS live linked.`;
        return { channel: 'sms', text, createdLot: lot };
      } else {
        return {
          channel: 'sms',
          text: `EKATRA Demo: Lot "${arg}" not found. Text "MY LOTS" to view your recent codes.`,
        };
      }
    }

    // 3. MY LOTS COMMAND
    if (upper === 'MY LOTS' || upper === 'LOTS' || upper === 'MYLOTS' || command === 'लॉट') {
      const lots = EkatraDB.getLots().slice(0, 3);
      if (lots.length === 0) {
        return { channel: 'sms', text: 'EKATRA Demo: No lots registered yet. Visit EKATRA App or WhatsApp.' };
      }

      const summary = lots.map((l) => `${l.lot_code} (${l.approx_weight_kg}kg) [${l.status}]`).join('\n');
      const text = `EKATRA Demo - Your Lots:\n${summary}\nText STATUS <CODE> for details.`;
      return { channel: 'sms', text, referencedLots: lots };
    }

    // 4. SELL COMMAND VIA SMS (e.g. "SELL PCB 20" or "SELL")
    if (command === 'SELL' || command === 'ADD' || command === 'विक') {
      const categories = EkatraDB.getCategories();
      if (parts.length >= 3) {
        const catCode = parts[1];
        const weight = parseFloat(parts[2]);
        const cat = categories.find((c) => c.code.toUpperCase() === catCode) || categories[0];

        if (!isNaN(weight) && weight > 0) {
          const recyclers = EkatraDB.getRecyclers();
          const best = recyclers[0];

          // WRITE DIRECTLY TO SHARED EKATRA DB
          const newLot = EkatraDB.createLot(
            cat.id,
            weight,
            'SMS Hub Dharavi',
            19.0435,
            72.8567,
            cat.image_url,
            `SMS Channel registered lot`,
            best?.id
          );

          const text =
            `EKATRA Demo Success!\n` +
            `Lot Created: ${newLot.lot_code}\n` +
            `Item: ${cat.code} (${weight}kg)\n` +
            `Est: Rs ${Math.round(weight * cat.benchmark_price_per_kg)}\n` +
            `OTP: ${newLot.handover_otp}\n` +
            `Visible in your EKATRA Mobile App.`;

          return { channel: 'sms', text, createdLot: newLot };
        }
      }

      return {
        channel: 'sms',
        text: `EKATRA Demo Sell format:\nText "SELL <CODE> <KG>"\nExample: SELL PCB 25\nAvailable codes: PCB, BATTERY, CABLE, CRT`,
      };
    }

    // 5. HELP COMMAND
    return {
      channel: 'sms',
      text:
        `EKATRA Demo SMS Commands:\n` +
        `• PRICE <CODE> (e.g. PRICE PCB)\n` +
        `• STATUS <LOT-CODE> (e.g. STATUS LOT-101)\n` +
        `• MY LOTS (Recent lots)\n` +
        `• SELL <CODE> <KG> (Quick lot)\n` +
        `• HELP (This menu)`,
    };
  }
}
