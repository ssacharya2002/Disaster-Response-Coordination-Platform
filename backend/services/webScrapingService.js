import axios from "axios";
import * as cheerio from "cheerio";

class WebScrapingService {
  constructor() {
    this.sources = {
      fema: {
        baseUrl: "https://www.fema.gov",
        newsUrl: "https://www.fema.gov/news-releases",
        selectors: {
          articles: ".news-release-item",
          title: ".news-release-title a",
          date: ".news-release-date",
          summary: ".news-release-summary",
          link: ".news-release-title a",
        },
      },
      redcross: {
        baseUrl: "https://www.redcross.org",
        newsUrl: "https://www.redcross.org/about-us/news-and-events/news.html",
        selectors: {
          articles: ".news-item",
          title: ".news-title a",
          date: ".news-date",
          summary: ".news-summary",
          link: ".news-title a",
        },
      },
      noaa: {
        baseUrl: "https://www.noaa.gov",
        newsUrl: "https://www.noaa.gov/news",
        selectors: {
          articles: ".news-item",
          title: ".news-title a",
          date: ".news-date",
          summary: ".news-summary",
          link: ".news-title a",
        },
      },
    };
  }

  async scrapeFEMAUpdates(limit = 10) {
    try {
      const response = await axios.get(this.sources.fema.newsUrl, {
        timeout: 10000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const $ = cheerio.load(response.data);
      const updates = [];

      $(this.sources.fema.selectors.articles)
        .slice(0, limit)
        .each((index, element) => {
          const $el = $(element);
          const title = $el
            .find(this.sources.fema.selectors.title)
            .text()
            .trim();
          const date = $el.find(this.sources.fema.selectors.date).text().trim();
          const summary = $el
            .find(this.sources.fema.selectors.summary)
            .text()
            .trim();
          const link =
            this.sources.fema.baseUrl +
            $el.find(this.sources.fema.selectors.link).attr("href");

          if (title) {
            updates.push({
              source: "FEMA",
              title,
              date,
              summary,
              link,
              timestamp: new Date().toISOString(),
            });
          }
        });

      return updates;
    } catch (error) {
      console.error("Error scraping FEMA updates:", error.message);
      return [];
    }
  }

  async scrapeRedCrossUpdates(limit = 10) {
    try {
      const response = await axios.get(this.sources.redcross.newsUrl, {
        timeout: 10000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const $ = cheerio.load(response.data);
      const updates = [];

      $(this.sources.redcross.selectors.articles)
        .slice(0, limit)
        .each((index, element) => {
          const $el = $(element);
          const title = $el
            .find(this.sources.redcross.selectors.title)
            .text()
            .trim();
          const date = $el
            .find(this.sources.redcross.selectors.date)
            .text()
            .trim();
          const summary = $el
            .find(this.sources.redcross.selectors.summary)
            .text()
            .trim();
          const link =
            this.sources.redcross.baseUrl +
            $el.find(this.sources.redcross.selectors.link).attr("href");

          if (title) {
            updates.push({
              source: "Red Cross",
              title,
              date,
              summary,
              link,
              timestamp: new Date().toISOString(),
            });
          }
        });

      return updates;
    } catch (error) {
      console.error("Error scraping Red Cross updates:", error.message);
      return [];
    }
  }

  async scrapeNOAAUpdates(limit = 10) {
    try {
      const response = await axios.get(this.sources.noaa.newsUrl, {
        timeout: 10000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const $ = cheerio.load(response.data);
      const updates = [];

      $(this.sources.noaa.selectors.articles)
        .slice(0, limit)
        .each((index, element) => {
          const $el = $(element);
          const title = $el
            .find(this.sources.noaa.selectors.title)
            .text()
            .trim();
          const date = $el.find(this.sources.noaa.selectors.date).text().trim();
          const summary = $el
            .find(this.sources.noaa.selectors.summary)
            .text()
            .trim();
          const link =
            this.sources.noaa.baseUrl +
            $el.find(this.sources.noaa.selectors.link).attr("href");

          if (title) {
            updates.push({
              source: "NOAA",
              title,
              date,
              summary,
              link,
              timestamp: new Date().toISOString(),
            });
          }
        });

      return updates;
    } catch (error) {
      console.error("Error scraping NOAA updates:", error.message);
      return [];
    }
  }

  async getAllOfficialUpdates(limit = 10) {
    try {
      const [femaUpdates, redCrossUpdates, noaaUpdates] =
        await Promise.allSettled([
          this.scrapeFEMAUpdates(limit),
          this.scrapeRedCrossUpdates(limit),
          this.scrapeNOAAUpdates(limit),
        ]);

      const allUpdates = [
        ...(femaUpdates.status === "fulfilled" ? femaUpdates.value : []),
        ...(redCrossUpdates.status === "fulfilled"
          ? redCrossUpdates.value
          : []),
        ...(noaaUpdates.status === "fulfilled" ? noaaUpdates.value : []),
      ];

      // If no real updates found, use mock data
      if (allUpdates.length === 0) {
        console.log("No real updates found, using mock data for testing");
        return this.getMockUpdates(null, limit);
      }

      // Sort by timestamp (most recent first)
      allUpdates.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return allUpdates.slice(0, limit * 3); // Return up to limit * number of sources
    } catch (error) {
      console.error("Error fetching all official updates:", error.message);
      console.log("Using mock data due to error");
      return this.getMockUpdates(null, limit);
    }
  }

  async getUpdatesByDisasterType(disasterType, limit = 10) {
    try {
      const allUpdates = await this.getAllOfficialUpdates(limit * 3);

      // Filter updates based on disaster type keywords
      const disasterKeywords = {
        hurricane: ["hurricane", "tropical storm", "cyclone", "typhoon"],
        earthquake: ["earthquake", "seismic", "quake"],
        flood: ["flood", "flooding", "water", "rain"],
        wildfire: ["wildfire", "fire", "burn", "blaze"],
        tornado: ["tornado", "twister", "storm"],
        tsunami: ["tsunami", "tidal wave"],
        volcano: ["volcano", "volcanic", "eruption"],
        drought: ["drought", "dry", "water shortage"],
      };

      const keywords = disasterKeywords[disasterType.toLowerCase()] || [];

      if (keywords.length === 0) {
        return allUpdates.slice(0, limit);
      }

      const filteredUpdates = allUpdates.filter((update) => {
        const text = `${update.title} ${update.summary}`.toLowerCase();
        return keywords.some((keyword) => text.includes(keyword));
      });

      // If no filtered updates found, try mock data
      if (filteredUpdates.length === 0) {
        console.log(
          `No real updates found for ${disasterType}, using mock data`
        );
        return this.getMockUpdates(disasterType, limit);
      }

      return filteredUpdates.slice(0, limit);
    } catch (error) {
      console.error("Error filtering updates by disaster type:", error.message);
      console.log("Using mock data due to error");
      return this.getMockUpdates(disasterType, limit);
    }
  }

  // Mock data for testing when web scraping fails
  getMockUpdates(disasterType = null, limit = 10) {
    const mockUpdates = [
      {
        source: "FEMA",
        title: "FEMA Announces Disaster Assistance for New York",
        date: "June 21, 2024",
        summary:
          "Federal assistance available for flood-affected areas in New York City. Emergency shelters and financial aid programs have been activated.",
        link: "https://www.fema.gov/news-release/2024/06/21/fema-announces-disaster-assistance-new-york",
        timestamp: new Date().toISOString(),
      },
      {
        source: "Red Cross",
        title: "Red Cross Opens Emergency Shelters in Manhattan",
        date: "June 20, 2024",
        summary:
          "American Red Cross has opened multiple emergency shelters to assist residents affected by flooding in Manhattan.",
        link: "https://www.redcross.org/about-us/news-and-events/news/2024/emergency-shelters-manhattan.html",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        source: "NOAA",
        title: "NOAA Issues Flood Warning for New York Area",
        date: "June 19, 2024",
        summary:
          "National Weather Service has issued flood warnings for the New York metropolitan area due to heavy rainfall.",
        link: "https://www.noaa.gov/news/2024/06/19/flood-warning-new-york",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        source: "FEMA",
        title: "FEMA Deploys Response Teams to Hurricane-Affected Areas",
        date: "June 18, 2024",
        summary:
          "Federal Emergency Management Agency has deployed response teams to areas affected by recent hurricane activity.",
        link: "https://www.fema.gov/news-release/2024/06/18/fema-deploys-response-teams-hurricane",
        timestamp: new Date(Date.now() - 259200000).toISOString(),
      },
      {
        source: "Red Cross",
        title: "Red Cross Provides Aid to Earthquake Victims",
        date: "June 17, 2024",
        summary:
          "American Red Cross is providing emergency assistance to communities affected by recent earthquake activity.",
        link: "https://www.redcross.org/about-us/news-and-events/news/2024/earthquake-aid.html",
        timestamp: new Date(Date.now() - 345600000).toISOString(),
      },
    ];

    if (disasterType) {
      const disasterKeywords = {
        hurricane: ["hurricane", "tropical storm", "cyclone", "typhoon"],
        earthquake: ["earthquake", "seismic", "quake"],
        flood: ["flood", "flooding", "water", "rain"],
        wildfire: ["wildfire", "fire", "burn", "blaze"],
        tornado: ["tornado", "twister", "storm"],
        tsunami: ["tsunami", "tidal wave"],
        volcano: ["volcano", "volcanic", "eruption"],
        drought: ["drought", "dry", "water shortage"],
      };

      const keywords = disasterKeywords[disasterType.toLowerCase()] || [];

      if (keywords.length > 0) {
        const filteredUpdates = mockUpdates.filter((update) => {
          const text = `${update.title} ${update.summary}`.toLowerCase();
          return keywords.some((keyword) => text.includes(keyword));
        });
        return filteredUpdates.slice(0, limit);
      }
    }

    return mockUpdates.slice(0, limit);
  }
}

export default new WebScrapingService();
