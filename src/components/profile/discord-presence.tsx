"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";

interface LanyardData {
  discord_user: {
    id: string;
    username: string;
    avatar: string;
  };
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: Array<{
    name: string;
    state?: string;
    details?: string;
    type: number;
  }>;
  listening_to_spotify: boolean;
  spotify?: {
    track_id: string;
    song: string;
    artist: string;
    album_art_url: string;
  };
}

export function DiscordPresence({ discordId }: { discordId: string }) {
  const [data, setData] = useState<LanyardData | null>(null);

  useEffect(() => {
    if (!discordId) return;
    
    // Fetch initial data
    fetch(`https://api.lanyard.rest/v1/users/${discordId}`)
      .then((res) => res.json())
      .then((body) => {
        if (body.success) {
          setData(body.data);
        }
      })
      .catch(() => {});
      
    // Connect to websocket for real-time updates
    const ws = new WebSocket("wss://api.lanyard.rest/socket");
    let interval: ReturnType<typeof setInterval>;
    
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.op === 1) {
        interval = setInterval(() => {
          ws.send(JSON.stringify({ op: 3 }));
        }, msg.d.heartbeat_interval);
        ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: discordId } }));
      }
      if (msg.t === "INIT_STATE" || msg.t === "PRESENCE_UPDATE") {
        setData(msg.d);
      }
    };
    
    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, [discordId]);

  if (!data) return null;

  const statusColor = 
    data.discord_status === "online" ? "#43b581" :
    data.discord_status === "idle" ? "#faa61a" :
    data.discord_status === "dnd" ? "#f04747" : "#747f8d";

  const activity = data.activities[0];
  let activityText = "";
  if (data.listening_to_spotify && data.spotify) {
    activityText = `Listening to ${data.spotify.song} by ${data.spotify.artist}`;
  } else if (activity) {
    if (activity.type === 0) activityText = `Playing ${activity.name}`;
    else if (activity.type === 3) activityText = `Watching ${activity.name}`;
    else activityText = activity.name;
  }

  return (
    <div className="mt-4 flex w-full max-w-sm flex-col gap-3 rounded-xl border border-white/10 bg-black/40 p-4 text-left shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png`}
            alt="Discord"
            className="h-12 w-12 rounded-full border border-white/10 bg-black/50"
          />
          <span
            className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-black"
            style={{ backgroundColor: statusColor }}
          />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 font-bold text-white text-shadow-sm">
            <MessageSquare size={14} className="text-white/70" />
            {data.discord_user.username}
          </div>
          {activityText ? (
            <div className="text-xs text-white/60 line-clamp-2">{activityText}</div>
          ) : (
            <div className="text-xs text-white/50 capitalize">{data.discord_status}</div>
          )}
        </div>
      </div>
    </div>
  );
}
