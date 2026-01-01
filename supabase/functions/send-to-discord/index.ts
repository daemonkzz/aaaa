import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdatePayload {
  type: 'update';
  title: string;
  subtitle?: string;
  category: string;
  version?: string;
  coverImageUrl?: string;
  updateId: string;
  siteUrl: string;
}

interface RulesPayload {
  type: 'rules';
  updatedRules: Array<{
    id: string;
    title: string;
    categoryTitle: string;
  }>;
  siteUrl: string;
}

type DiscordPayload = UpdatePayload | RulesPayload;

const getCategoryEmoji = (category: string): string => {
  switch (category) {
    case 'update':
      return '🔧';
    case 'news':
      return '📰';
    default:
      return '📢';
  }
};

const getCategoryLabel = (category: string): string => {
  switch (category) {
    case 'update':
      return 'Güncelleme';
    case 'news':
      return 'Haber';
    default:
      return 'Duyuru';
  }
};

const getEmbedColor = (type: string, category?: string): number => {
  if (type === 'rules') return 0xFF9500; // Orange for rules
  if (category === 'news') return 0x9B59B6; // Purple for news
  return 0x4C9EFF; // Blue for updates
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: DiscordPayload = await req.json();
    console.log('Received payload:', JSON.stringify(payload));

    let webhookUrl: string;
    let discordPayload: Record<string, unknown>;

    if (payload.type === 'update') {
      webhookUrl = Deno.env.get('DISCORD_UPDATES_WEBHOOK') || '';
      
      if (!webhookUrl) {
        console.error('DISCORD_UPDATES_WEBHOOK not configured');
        return new Response(
          JSON.stringify({ error: 'Discord webhook URL not configured for updates' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const categoryEmoji = getCategoryEmoji(payload.category);
      const categoryLabel = getCategoryLabel(payload.category);
      const updateUrl = `${payload.siteUrl}/guncellemeler/${payload.updateId}`;

      const fields = [
        {
          name: '📂 Kategori',
          value: categoryLabel,
          inline: true,
        },
      ];

      if (payload.version) {
        fields.push({
          name: '🔖 Versiyon',
          value: payload.version,
          inline: true,
        });
      }

      discordPayload = {
        content: '@everyone 🎉 **Yeni bir güncelleme yayında!**',
        embeds: [
          {
            title: `${categoryEmoji} ${payload.title}`,
            description: payload.subtitle || 'Yeni güncellemeler ve değişiklikler için tıklayın.',
            url: updateUrl,
            color: getEmbedColor('update', payload.category),
            fields,
            ...(payload.coverImageUrl && {
              image: { url: payload.coverImageUrl },
              thumbnail: { url: payload.coverImageUrl },
            }),
            footer: {
              text: 'KAZE RP | Güncellemeler',
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };
    } else if (payload.type === 'rules') {
      webhookUrl = Deno.env.get('DISCORD_RULES_WEBHOOK') || '';
      
      if (!webhookUrl) {
        console.error('DISCORD_RULES_WEBHOOK not configured');
        return new Response(
          JSON.stringify({ error: 'Discord webhook URL not configured for rules' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const rulesUrl = `${payload.siteUrl}/kurallar`;
      
      // Group rules by category
      const rulesList = payload.updatedRules
        .map(rule => `• **${rule.id}** ${rule.title}`)
        .join('\n');

      discordPayload = {
        content: '@everyone 📜 **Sunucu kuralları güncellendi!**',
        embeds: [
          {
            title: '⚖️ Kural Güncellemesi',
            description: 'Aşağıdaki kurallar güncellenmiştir. Lütfen inceleyin.',
            url: rulesUrl,
            color: getEmbedColor('rules'),
            fields: [
              {
                name: '📋 Güncellenen Kurallar',
                value: rulesList || 'Detaylar için siteyi ziyaret edin.',
                inline: false,
              },
            ],
            footer: {
              text: 'KAZE RP | Kurallar',
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid payload type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending to Discord:', JSON.stringify(discordPayload));

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Discord API error', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Discord message sent successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Discord notification sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
