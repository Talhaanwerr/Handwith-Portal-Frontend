import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GAMES } from "@/constants/games";
import { GamePlayer } from "@/features/super-admin/library/GamePlayer";

interface Props {
  params: Promise<{ gameId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gameId } = await params;
  const game = GAMES.find((g) => g.id === gameId);
  return { title: game ? game.title : "Game" };
}

export default async function GamePlayerPage({ params }: Props) {
  const { gameId } = await params;
  const game = GAMES.find((g) => g.id === gameId);
  if (!game) notFound();

  return <GamePlayer gameId={game.id} />;
}
