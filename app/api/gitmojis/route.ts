export async function GET() {
    const res = await fetch("https://api.jsonbin.io/v3/b/YOUR_BIN_ID", {
      headers: {
        "X-Master-Key": "YOUR_API_KEY",
      },
      cache: "no-store",
    });
  
    const data = await res.json();
  
    // Adjust this line to match your actual structure:
    return NextResponse.json(data.record.emojis.nature); 
  }
  