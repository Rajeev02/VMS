export const resetToDashboard = (navigation: any) => {
  navigation.reset({
    index: 0,
    routes: [
      {
        name: 'Tabs',
        state: {
          routes: [{ name: 'Home' }],
        },
      },
    ],
  });
};

export const resetToVisitors = (navigation: any) => {
  navigation.reset({
    index: 0,
    routes: [
      {
        name: 'Tabs',
        state: {
          routes: [{ name: 'Visitors' }],
        },
      },
    ],
  });
};
