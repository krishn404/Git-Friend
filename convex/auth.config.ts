const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

export default {
  providers: projectId
    ? [
        {
          domain: `https://securetoken.google.com/${projectId}`,
          applicationID: projectId,
        },
      ]
    : [],
};
