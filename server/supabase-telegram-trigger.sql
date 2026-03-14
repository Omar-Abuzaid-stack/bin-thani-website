-- =====================================================
-- BIN THANI REAL ESTATE - MASTER TELEGRAM NOTIFICATION SYSTEM
-- FINAL ROBUST VERSION (No field shadowing)
-- =====================================================

-- 1. Enable the pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Create the Master Notification Function
CREATE OR REPLACE FUNCTION public.notify_telegram_master()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  telegram_token TEXT := '8730614252:AAGuV_V_iHfdmVrfiol_6fCuHCrTEboYyjw';
  chat_id TEXT := '-1003887183193';
  payload JSONB;
  tg_message TEXT; -- Renamed from 'message' to avoid shadowing column names
  table_name TEXT;
  emoji TEXT;
BEGIN
  table_name := TG_TABLE_NAME;
  payload := to_jsonb(NEW);
  
  -- Set Emoji based on table
  CASE table_name
    WHEN 'leads' THEN emoji := '🔔';
    WHEN 'chat_messages' THEN emoji := '💬';
    WHEN 'visitor_logs' THEN emoji := '🌐';
    WHEN 'properties' THEN emoji := '🏠';
    WHEN 'developers' THEN emoji := '🏢';
    ELSE emoji := '📢';
  END CASE;

  -- 1. LEADS FORMATTING (Strictly capturing fields)
  IF table_name = 'leads' THEN
    tg_message := '🔔 *New Lead — Bin Thani Real Estate*' || E'\n\n' ||
               '👤 *Name:* ' || COALESCE(payload->>'name', 'Not provided') || E'\n' ||
               '📞 *Phone:* ' || COALESCE(payload->>'phone', 'Not provided') || E'\n' ||
               '📧 *Email:* ' || COALESCE(payload->>'email', 'Not provided') || E'\n' ||
               '🏠 *Property Interest:* ' || COALESCE(payload->>'interest', 'Not provided') || E'\n' ||
               '💬 *Message:* ' || COALESCE(payload->>'message', 'Not provided') || E'\n' ||
               '🕐 *Time:* ' || TO_CHAR(NEW.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Dubai', 'DD/MM/YYYY HH:MI AM') || ' (UAE Time)';

  -- 2. CHAT MESSAGES
  ELSIF table_name = 'chat_messages' THEN
    tg_message := '💬 *New Chat Interaction — Bin Thani Real Estate*' || E'\n\n' ||
               '👤 *User:* ' || COALESCE(payload->>'user_name', 'Visitor') || E'\n' ||
               '📞 *Phone:* ' || COALESCE(payload->>'user_phone', 'N/A') || E'\n' ||
               '💬 *User Message:* ' || COALESCE(payload->>'user_message', 'N/A') || E'\n' ||
               '🤖 *Bot Response:* ' || LEFT(COALESCE(payload->>'bot_response', 'N/A'), 200) || '...';

  -- 3. VISITOR LOGS
  ELSIF table_name = 'visitor_logs' THEN
    tg_message := '🌐 *Website Visitor — Bin Thani Real Estate*' || E'\n\n' ||
               '📄 *Page:* ' || COALESCE(payload->>'page_path', 'N/A') || E'\n' ||
               '📍 *IP:* ' || COALESCE(payload->>'ip_address', 'N/A');

  ELSE
    -- Generic format for any other table
    tg_message := emoji || ' *New Record in ' || table_name || '*' || E'\n\n' ||
               '🆔 *ID:* ' || COALESCE(payload->>'id', 'N/A');
  END IF;

  -- Send the request to Telegram API using pg_net
  PERFORM net.http_post(
    url := 'https://api.telegram.org/bot' || telegram_token || '/sendMessage',
    body := jsonb_build_object(
      'chat_id', chat_id,
      'text', tg_message,
      'parse_mode', 'Markdown'
    )
  );
  
  RETURN NEW;
END;
$$;

-- 3. Re-create Triggers (Ensuring fresh registration)
DROP TRIGGER IF EXISTS on_lead_added_telegram ON public.leads;
CREATE TRIGGER on_lead_added_telegram AFTER INSERT ON public.leads FOR EACH ROW EXECUTE FUNCTION public.notify_telegram_master();

-- (Repeat for other tables if needed, lead is priority now)
