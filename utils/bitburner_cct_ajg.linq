<Query Kind="Program">
  <DisableMyExtensions>true</DisableMyExtensions>
</Query>

void Main()
{
	var rando = new Random();
	for (int t = 0; t < 1; t++)
	{
		var input = new List<int>();
		var l = rando.Next(1, 10) + 1;
		for (int r = 0; r < l; r++)
			input.Add(rando.Next(l));
		$"[ {string.Join(", ", input)} ]".Dump();
		solve(input.ToArray()).Dump("=");
	}
}

public int solve(int[] input)
{
	//var paths = new List<int>();
	//var max = input.Length - 1;
	//var lp = 0;
	var j = 0;
	for (var p = 0; p < input.Length; p++)
	{
		//p.Dump("p");
		j++;
		var v = parseInt(input[p]).Dump("v");
		if (v == 0) return 0;
		else if (p + v >= input.Length - 1) return j > 0 ? j : 1;
		var x = input.slice(p+1, Math.Min(v, input.Length - 1 - p + v)).Max().Dump("x");
		if (x == 0) return 0;
		var o = (p + v).Dump("pv");
		while (o < input.Length - 1 && input[o--] < x && o >= p) {
			o.Dump("o");
		}
		p = o;
		if (p >= input.Length -1) break;
	}
	return j;
	#region _UHG_
	//var jumps = new List<int>();
	//var jumps = new List<(int before, int[] after)>();
	//for (int p = 0; p < input.Length; p++)
	//{
	//	jumps.Add((p, new List<int>().AddRange());
	//}
	//if (input[0] == 0) return 0;
	//for (var c = 0; c < input.Length; c++)
	//{
	//	j = 0;
	//	//var size = paths.Count;
	//	if (canReach(max, c, input[c]).Dump($"{max}/{c}/{input[c]}")) 
	//	{
	//		paths.Add(j+1);
	//		if (paths.Contains(1)) return 1;
	//	}
	//	else if (input[c] != 0) j++;
	//	else break;
	//	//if (parseInt(input[c]) < 1) continue;
	//	lp = c;
	//	for (var p = lp; p < input.Length && parseInt(input[p]) > 0; p++)
	//	{
	//		var pv = parseInt(input[p]).Dump("pv");
	//		if (p+pv >= input.Length) { paths.Add(j); lp = 0; break; }
	//		else if (pv == 0) { lp = 0; continue; }
	//		else
	//		{
	//			for (var i = 0; i < parseInt(input[p]); i++)
	//			{
	//				if (paths.Count > 0 && j > paths.Min()) { "j too big".Dump(); lp = 0; break; }
	//				else if (p + i >= max) { paths.Add(j++); "made it".Dump(); lp = 0; break; }
	//				else if (i == parseInt(input[p]) - 1) { $"no more moves {p}.{i}".Dump(); }
	//				
	//			}
	//			if (lp == 0) break;
	//		}
	//	}
	//	//if (paths.Count > size) j = 1;
	//}
	
	#endregion
	//return paths.Count > 0 ? paths.Min(p => p) : 0;
	int parseInt(object o) => int.Parse(o.ToString());
	bool canReach(int maxPos, int pos, int val) => pos + val >= maxPos; 
	//int[] slice(int[] array, int start, int len) => array.Skip(start).Take(len).ToArray(); 
}

public static partial class _
{
	public static int[] slice(this int[] array, int start, int len) => array.Skip(start).Take(len).ToArray();
}