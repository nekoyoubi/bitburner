<Query Kind="Program">
  <DisableMyExtensions>true</DisableMyExtensions>
</Query>

void Main()
{
	/*
	Given the following string containing only digits, return an array with all possible valid IP address combinations that can be created from the string:

	 17616311428

	 Note that an octet cannot begin with a '0' unless the number itself is actually 0. For example, '192.168.010.1' is not a valid IP.

	 Examples:

	 25525511135 -> [255.255.11.135, 255.255.111.35]
	 1938718066 -> [193.87.180.66]
	*/

	var tests = new[] { 
		"123123123123",
		"0000",
		"25525511135",
		"1938718066",
		"17616311428"
	};
	
	foreach (var test in tests) solveGenerateIpAddresses(test.Dump()).Dump();
	
}

public string[] solveGenerateIpAddresses(string input)
{
	var answers = new List<string>();
	var il = input.Length;
	for (int i1 = 1; i1 < 4 && i1 < il; i1++)
	{
		var o1 = input.substring(0, i1);
		if (!valid(o1)) continue;
		for (int i2 = 1; i2 < 4 && i1 + i2 < il; i2++)
		{
			var o2 = input.substring(i1, i1 + i2);
			if (!valid(o2)) continue;
			for (int i3 = 1; i3 < 4 && i1 + i2 + i3 < il; i3++)
			{
				var o3 = input.substring(i1 + i2, (i1 + i2 + i3));
				var o4 = input.substring(i1 + i2 + i3);
				if (!valid(o3) || !valid(o4)) continue;
				answers.Add($"{o1}.{o2}.{o3}.{o4}");
			}	
		}
	}
	return answers.ToArray();
	bool valid(string octet) => !(octet.StartsWith("0") && octet.Length > 1) && byte.TryParse(octet, out byte __b);
	//if (input.Length > 11) return string.Join(".", Regex.Matches(input, @"\d{3}").Cast<Match>().Select(m => m.Value));
	////return "";
	////var stuffed = string.Join(".", input.ToArray());
	////return stuffed.Dump();
	//var ip = new List<string>();
	//var octet = string.Empty;
	//var p = -1;
	//for (int o = 0; o < 4; o++)
	//{
	//	o.Dump("o");
	//	for (int c = 1; c < 4; c++)
	//	{
	//		if ((p++ + c) >= input.Length) { "wtflol".Dump(); break; }
	//		var s = input.Substring(p.Dump("p"), Math.Min(c, input.Length - 1 - p)).Dump("s");
	//		if (s.Length > 1 && s.StartsWith("0") || int.Parse(s) > 255) { p--; "ng".Dump(); break; };
	//		if (c == 3) octet += s;
	//	}
	//	ip.Add(octet);
	//}
	//return string.Join(".", ip);
}

public static partial class _
{
	public static string substring(this string source, int start, int end) =>
		source.Substring(start, end - start);
		
	public static string substring(this string source, int start) =>
		source.Substring(start);
}