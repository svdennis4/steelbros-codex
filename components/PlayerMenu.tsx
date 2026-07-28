import SignOutButton from "@/components/SignOutButton";

type PlayerMenuProps = {
  user: {
    name?: string | null;
    image?: string | null;
  };
};

export default function PlayerMenu({ user }: PlayerMenuProps) {
  return (
    <div className="flex items-center gap-4">
      {user.image && (
        <img
          src={user.image}
          alt=""
          className="h-10 w-10 rounded-full border border-zinc-700"
        />
      )}

      <div className="hidden text-right sm:block">
        <p className="text-sm font-bold">
          {user.name}
        </p>

        <p className="text-xs text-zinc-500">
          PLAYER
        </p>
      </div>

      <SignOutButton />
    </div>
  );
}