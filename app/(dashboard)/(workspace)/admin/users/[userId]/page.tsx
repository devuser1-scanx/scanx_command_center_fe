type UserDetailsPageProps = {
  params: Promise<{ userId: string }>;
};

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
  const { userId } = await params;
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">User Details</h1>
        <p className="text-sm text-muted-foreground mt-2">Viewing User ID: {userId}</p>
      </div>
    </main>
  );
}
